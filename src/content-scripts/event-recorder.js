import { createApp } from 'vue'
import { finder } from '@medv/finder'

import {
  uiActions,
  isDarkMode,
  controlMessages,
  eventsToRecord,
  overlaySelectors,
} from '@/services/constants'

import UIController from './screenshot-controller'
import OverlayApp from './OverlayApp.vue'
import Selector from './Selector.vue'

export default class EventRecorder {
  constructor() {
    this._boundedMessageListener = null
    this._eventLog = []
    this._previousEvent = null
    this._dataAttribute = null
    this._darkMode = false
    this._uiController = null
    this._screenShotMode = false
    this._isTopFrame = window.location === window.parent.location
    this._isRecordingClicks = true

    this.mouseOverEvent = null
    this.overlayApp = null
    this.overlayContainer = null

    this.selectorContainer = null
    this.selectorApp = null
  }

  boot() {
    // We need to check the existence of chrome for testing purposes
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['options'], ({ options }) => {
        this._darkMode = options && options.extension ? options.extension.darkMode : isDarkMode()

        const { dataAttribute } = options ? options.code : {}
        if (dataAttribute) {
          this._dataAttribute = dataAttribute
        }
        this._initializeRecorder()
      })
    } else {
      this._initializeRecorder()
    }

    chrome.storage.onChanged.addListener(({ options = null }) => {
      if (options) {
        this._darkMode = options.newValue.extension.darkMode
        this.overlayApp.darkMode = options.newValue.extension.darkMode
      }
    })
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

    this.overlayContainer = document.createElement('div')
    this.overlayContainer.id = overlaySelectors.OVERLAY_ID
    document.body.appendChild(this.overlayContainer)

    this.selectorContainer = document.createElement('div')
    this.selectorContainer.id = overlaySelectors.OVERLAY_ID + 1
    document.body.appendChild(this.selectorContainer)

    this.selectorApp = createApp(Selector).mount('#' + overlaySelectors.OVERLAY_ID + 1)
    this.overlayApp = createApp(OverlayApp).mount('#' + overlaySelectors.OVERLAY_ID)

    this.overlayApp.darkMode = this._darkMode

    this.mouseOverEvent = e => {
      const selector = this._getSelector(e)
      this.overlayApp.currentSelector = selector.includes('#' + overlaySelectors.OVERLAY_ID)
        ? ''
        : selector

      if (
        this.overlayApp.currentSelector &&
        (!this._screenShotMode || this._uiController._isClipped)
      ) {
        this.selectorApp.move(e, [overlaySelectors.OVERLAY_ID])
      }
    }

    window.document.addEventListener('mouseover', this.mouseOverEvent)
  }

  _dettachOverlay() {
    console.debug('dettach overlay')
    document.body.removeChild(this.overlayContainer)
    document.body.removeChild(this.selectorContainer)

    this.overlayContainer = null
    this.overlayApp = null
    this.selectorContainer = null
    this.selectorApp = null

    window.document.removeEventListener('mouseover', this.mouseOverEvent)
  }

  _addAllListeners(events) {
    const boundedRecordEvent = this._recordEvent.bind(this)
    events.forEach(type => window.addEventListener(type, boundedRecordEvent, true))
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

      if (selector.includes('#' + overlaySelectors.OVERLAY_ID)) {
        return
      }

      // HERE
      this.overlayApp.showBorder = true

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
    document.body.classList.add(overlaySelectors.CURSOR_CAMERA_CLASS)

    console.debug('screenshot mode:', this._screenShotMode)

    this._screenShotMode
      ? this._uiController.startScreenshotMode()
      : this._uiController.stopScreenshotMode()

    this._uiController.on('click', event => {
      this._screenShotMode = false
      this.overlayApp.isScreenShotMode = false
      document.body.classList.add(overlaySelectors.FLASH_CLASS)
      document.body.classList.remove(overlaySelectors.CURSOR_CAMERA_CLASS)
      setTimeout(() => document.body.classList.remove(overlaySelectors.FLASH_CLASS), 1000)

      this._sendMessage({ control: controlMessages.GET_SCREENSHOT, value: event.clip })
      this._enableClickRecording()
    })
  }

  _cancelScreenshotMode() {
    if (!this._screenShotMode) {
      return
    }
    this._screenShotMode = false
    this.overlayApp.isScreenShotMode = false
    document.body.classList.remove(overlaySelectors.CURSOR_CAMERA_CLASS)
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
      return `[${this._dataAttribute}="${e.target.getAttribute(this._dataAttribute)}"]`
    }

    if (e.target.id) {
      return `#${e.target.id}`
    }

    const selector = finder(e.target, {
      seedMinLength: 5,
      optimizedMinLength: e.target.id ? 2 : 10,
      attr: name => name === this._dataAttribute,
    })

    return selector
  }

  static _getCoordinates(evt) {
    const eventsWithCoordinates = {
      mouseup: true,
      mousedown: true,
      mousemove: true,
      mouseover: true,
    }
    return eventsWithCoordinates[evt.type] ? { x: evt.clientX, y: evt.clientY } : null
  }
}
