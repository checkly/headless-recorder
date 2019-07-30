import eventsToRecord from '../code-generator/dom-events-to-record'
import UIController from './UIController'
import actions from '../models/extension-ui-actions'
import ctrl from '../models/extension-control-messages'
import finder from '@medv/finder'

const DEFAULT_MOUSE_CURSOR = 'default'

export default class EventRecorder {
  constructor () {
    this._boundedMessageListener = null
    this._eventLog = []
    this._previousEvent = null
    this._dataAttribute = null
    this._uiController = null
    this._screenShotMode = false
    this._isTopFrame = (window.location === window.parent.location)
    this._isRecordingClicks = true
  }

  boot () {
    // We need to check the existence of chrome for testing purposes
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['options'], ({options}) => {
        const { dataAttribute } = options ? options.code : {}
        if (dataAttribute) {
          this._dataAttribute = dataAttribute
        }
        this._initializeRecorder()
      })
    } else {
      this._initializeRecorder()
    }
  }

  _initializeRecorder () {
    const events = Object.values(eventsToRecord)
    if (!window.pptRecorderAddedControlListeners) {
      this._addAllListeners(events)
      this._boundedMessageListener = this._boundedMessageListener || this._handleBackgroundMessage.bind(this)
      chrome.runtime.onMessage.addListener(this._boundedMessageListener)
      window.pptRecorderAddedControlListeners = true
    }

    if (!window.document.pptRecorderAddedControlListeners && chrome.runtime && chrome.runtime.onMessage) {
      window.document.pptRecorderAddedControlListeners = true
    }

    if (this._isTopFrame) {
      this._sendMessage({ control: ctrl.EVENT_RECORDER_STARTED })
      this._sendMessage({ control: ctrl.GET_CURRENT_URL, href: window.location.href })
      this._sendMessage({ control: ctrl.GET_VIEWPORT_SIZE, coordinates: { width: window.innerWidth, height: window.innerHeight } })
      console.debug('Puppeteer Recorder in-page EventRecorder started')
    }
  }

  _handleBackgroundMessage (msg, sender, sendResponse) {
    console.debug('content-script: message from background', msg)
    if (msg && msg.action) {
      switch (msg.action) {
        case actions.TOGGLE_SCREENSHOT_MODE:
          this._handleScreenshotMode(false)
          break
        case actions.TOGGLE_SCREENSHOT_CLIPPED_MODE:
          this._handleScreenshotMode(true)
          break
        default:
      }
    }
  }

  _addAllListeners (events) {
    const boundedRecordEvent = this._recordEvent.bind(this)
    events.forEach(type => {
      window.addEventListener(type, boundedRecordEvent, true)
    })
  }

  _sendMessage (msg) {
    // filter messages based on enabled / disabled features
    if (msg.action === 'click' && !this._isRecordingClicks) return

    try {
      // poor man's way of detecting whether this script was injected by an actual extension, or is loaded for
      // testing purposes
      if (chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.sendMessage(msg)
      } else {
        this._eventLog.push(msg)
      }
    } catch (err) {
      console.debug('caught error', err)
    }
  }

  _recordEvent (e) {
    if (this._previousEvent && this._previousEvent.timeStamp === e.timeStamp) return
    this._previousEvent = e

    // we explicitly catch any errors and swallow them, as none node-type events are also ingested.
    // for these events we cannot generate selectors, which is OK
    try {
      const optimizedMinLength = (e.target.id) ? 2 : 10 // if the target has an id, use that instead of multiple other selectors
      const selector = this._dataAttribute
        ? finder(e.target, {seedMinLength: 5, optimizedMinLength: optimizedMinLength, attr: (name, _value) => name === this._dataAttribute})
        : finder(e.target, {seedMinLength: 5, optimizedMinLength: optimizedMinLength})

      const msg = {
        selector: selector,
        value: e.target.value,
        tagName: e.target.tagName,
        action: e.type,
        keyCode: e.keyCode ? e.keyCode : null,
        href: e.target.href ? e.target.href : null,
        coordinates: EventRecorder._getCoordinates(e)
      }
      this._sendMessage(msg)
    } catch (e) {}
  }

  _getEventLog () {
    return this._eventLog
  }

  _clearEventLog () {
    this._eventLog = []
  }

  _handleScreenshotMode (isClipped) {
    this._disableClickRecording()
    this._uiController = new UIController({ showSelector: isClipped })
    this._screenShotMode = !this._screenShotMode
    document.body.style.cursor = 'crosshair'

    console.debug('screenshot mode:', this._screenShotMode)

    if (this._screenShotMode) {
      this._uiController.showSelector()
    } else {
      this._uiController.hideSelector()
    }

    this._uiController.on('click', event => {
      this._screenShotMode = false
      document.body.style.cursor = DEFAULT_MOUSE_CURSOR
      this._sendMessage({ control: ctrl.GET_SCREENSHOT, value: event.clip })
      this._enableClickRecording()
    })
  }

  _disableClickRecording () {
    this._isRecordingClicks = false
  }

  _enableClickRecording () {
    this._isRecordingClicks = true
  }

  static _getCoordinates (evt) {
    const eventsWithCoordinates = {
      mouseup: true,
      mousedown: true,
      mousemove: true,
      mouseover: true
    }
    return eventsWithCoordinates[evt.type] ? { x: evt.clientX, y: evt.clientY } : null
  }

  static _formatDataSelector (element, attribute) {
    return `[${attribute}="${element.getAttribute(attribute)}"]`
  }
}
