import { createApp } from 'vue'
import { finder } from '@medv/finder'

import {
  uiActions,
  controlMessages,
  eventsToRecord,
} from '@/services/constants'

import UIController from './screenshot-controller'
import OverlayApp from './OverlayApp.vue'

export default class EventRecorder {
  constructor() {
    this._boundedMessageListener = null
    this._eventLog = []
    this._previousEvent = null
    this._dataAttribute = null
    this._uiController = null
    this._screenShotMode = false
    this._isTopFrame = window.location === window.parent.location
    this._isRecordingClicks = true

    this.mouseOverEvent = null
    this.mouseOutEvent = null
    this.overlayApp = null
    this.overlayContainer = null
  }

  boot() {
    // We need to check the existence of chrome for testing purposes
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['options'], ({ options }) => {
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

  _initializeRecorder() {
    const events = Object.values(eventsToRecord)
    if (!window.pptRecorderAddedControlListeners) {
      this._addAllListeners(events)
      this._boundedMessageListener =
        this._boundedMessageListener || this._handleBackgroundMessage.bind(this)
      chrome.runtime.onMessage.addListener(this._boundedMessageListener)
      window.pptRecorderAddedControlListeners = true
    }

    if (
      !window.document.pptRecorderAddedControlListeners &&
      chrome.runtime &&
      chrome.runtime.onMessage
    ) {
      window.document.pptRecorderAddedControlListeners = true
    }

    if (this._isTopFrame) {
      this._sendMessage({ control: controlMessages.EVENT_RECORDER_STARTED })
      this._sendMessage({
        control: controlMessages.GET_CURRENT_URL,
        href: window.location.href,
      })
      this._sendMessage({
        control: controlMessages.GET_VIEWPORT_SIZE,
        coordinates: { width: window.innerWidth, height: window.innerHeight },
      })
      console.debug('Headless Recorder in-page EventRecorder started')
    }
  }

  _handleBackgroundMessage(msg) {
    console.debug('content-script: message from background', msg)
    if (msg && msg.action) {
      switch (msg.action) {
        case uiActions.TOGGLE_SCREENSHOT_MODE:
          this._handleScreenshotMode(false)
          break

        case uiActions.TOGGLE_SCREENSHOT_CLIPPED_MODE:
          this._handleScreenshotMode(true)
          break

        case uiActions.CLOSE_SCREENSHOT_MODE:
          this._cancelScreenshotMode()
          break

        case uiActions.TOGGLE_OVERLAY:
          msg.value ? this._attachOverlay() : this._dettachOverlay()
          break

        case uiActions.PAUSE:
          this.overlayApp.isPaused = true
          break

        case uiActions.UN_PAUSE:
          this.overlayApp.isPaused = false
          break
      }
    }
  }

  _attachOverlay() {
    console.debug('attach overlay')

    if (this.overlayContainer) {
      return
    }

    const overlayId = 'headless-recorder'
    const currentSelectorClass = 'headless-recorder-selected-element'

    this.overlayContainer = document.createElement('div')
    this.overlayContainer.id = overlayId
    document.body.appendChild(this.overlayContainer)

    this.overlayApp = createApp(OverlayApp).mount('#' + overlayId)

    this.mouseOverEvent = e => {
      const selector = this._getSelector(e)
      this.overlayApp.currentSelector = selector.includes('#' + overlayId)
        ? ''
        : selector

      if (
        this.overlayApp.currentSelector &&
        (!this._screenShotMode || this._uiController._isClipped)
      ) {
        e.target.classList.add(currentSelectorClass)
      }
    }

    this.mouseOutEvent = e => {
      e.target.classList.remove(currentSelectorClass)
    }

    window.document.addEventListener('mouseover', this.mouseOverEvent)
    window.document.addEventListener('mouseout', this.mouseOutEvent)
  }

  _dettachOverlay() {
    console.debug('dettach overlay')
    document.body.removeChild(this.overlayContainer)
    this.overlayContainer = null
    this.overlayApp = null
    window.document.removeEventListener('mouseover', this.mouseOverEvent)
    window.document.removeEventListener('mouseout', this.mouseOutEvent)
  }

  _addAllListeners(events) {
    const boundedRecordEvent = this._recordEvent.bind(this)
    events.forEach(type => {
      window.addEventListener(type, boundedRecordEvent, true)
    })
  }

  _sendMessage(msg) {
    // filter messages based on enabled / disabled features
    if (msg.action === 'click' && !this._isRecordingClicks) {
      return
    }

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

  _recordEvent(e) {
    if (this._previousEvent && this._previousEvent.timeStamp === e.timeStamp) {
      return
    }
    this._previousEvent = e

    // we explicitly catch any errors and swallow them, as none node-type events are also ingested.
    // for these events we cannot generate selectors, which is OK
    try {
      const selector = this._getSelector(e)

      if (selector.includes('#headless-recorder-overlay')) {
        return
      }

      this._sendMessage({
        selector,
        value: e.target.value,
        tagName: e.target.tagName,
        action: e.type,
        keyCode: e.keyCode ? e.keyCode : null,
        href: e.target.href ? e.target.href : null,
        coordinates: EventRecorder._getCoordinates(e),
      })
    } catch (err) {
      console.error(err)
    }
  }

  _getEventLog() {
    return this._eventLog
  }

  _clearEventLog() {
    this._eventLog = []
  }

  _handleScreenshotMode(isClipped) {
    this._disableClickRecording()
    this._uiController = new UIController({ isClipped })
    this._screenShotMode = !this._screenShotMode
    document.body.classList.add('headless-recorder-camera-cursor')

    console.debug('screenshot mode:', this._screenShotMode)

    if (this._screenShotMode) {
      this._uiController.startScreenshotMode()
    } else {
      this._uiController.stopScreenshotMode()
    }

    this._uiController.on('click', event => {
      this._screenShotMode = false
      this.overlayApp.isScreenShotMode = false
      document.body.classList.add('screenshot-this')
      document.body.classList.remove('headless-recorder-camera-cursor')
      setTimeout(() => {
        document.body.classList.remove('screenshot-this')
      }, 1000)
      this._sendMessage({
        control: controlMessages.GET_SCREENSHOT,
        value: event.clip,
      })
      this._enableClickRecording()
    })
  }

  _cancelScreenshotMode() {
    if (!this._screenShotMode) {
      return
    }
    this._screenShotMode = false
    this.overlayApp.isScreenShotMode = false
    document.body.classList.remove('headless-recorder-camera-cursor')
    this._uiController.stopScreenshotMode()
    this._enableClickRecording()
  }

  _disableClickRecording() {
    this._isRecordingClicks = false
  }

  _enableClickRecording() {
    this._isRecordingClicks = true
  }

  _getSelector(e) {
    if (this._dataAttribute && e.target.getAttribute(this._dataAttribute)) {
      return `[${this._dataAttribute}="${e.target.getAttribute(
        this._dataAttribute
      )}"]`
    }

    if (e.target.id) {
      return `#${e.target.id}`
    }

    return finder(e.target, {
      seedMinLength: 5,
      optimizedMinLength: e.target.id ? 2 : 10,
      attr: name => name === this._dataAttribute,
    })
  }

  static _getCoordinates(evt) {
    const eventsWithCoordinates = {
      mouseup: true,
      mousedown: true,
      mousemove: true,
      mouseover: true,
    }
    return eventsWithCoordinates[evt.type]
      ? { x: evt.clientX, y: evt.clientY }
      : null
  }
}
