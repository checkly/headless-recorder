import badge from '@/services/badge'
import { uiActions, controlMessages, headlessActions } from '@/services/constants'

export default class RecordingHandler {
  constructor() {
    this._recording = []
    this._boundedMessageHandler = null

    // Some events are sent double on page navigations to simplify the event recorder.
    // We keep some simple state to disregard events if needed.
    this._hasGoto = false
    this._hasViewPort = false
  }

  start() {
    this.cleanUp(() => {
      this._hasGoto = false
      this._hasViewPort = false
      this._boundedMessageHandler = this.handleMessage.bind(this)

      chrome.runtime.onMessage.addListener(this._boundedMessageHandler)
    })
  }

  stop() {
    chrome.runtime.onMessage.removeListener(this._boundedMessageHandler)
    chrome.storage.local.set({ recording: this._recording })
  }

  cleanUp(cb) {
    this._recording = []
    chrome.storage.local.remove('recording', () => cb && cb())
  }

  recordCurrentUrl(href) {
    if (!this._hasGoto) {
      console.debug('recording goto* for:', href)
      this.handleMessage({
        selector: undefined,
        value: undefined,
        action: headlessActions.GOTO,
        href,
      })
      this._hasGoto = true
    }
  }

  recordCurrentViewportSize(value) {
    if (!this._hasViewPort) {
      this.handleMessage({
        selector: undefined,
        value,
        action: headlessActions.VIEWPORT,
      })
      this._hasViewPort = true
    }
  }

  recordScreenshot(value) {
    this.handleMessage({
      selector: undefined,
      value,
      action: headlessActions.SCREENSHOT,
    })
  }

  handleMessage(msg, sender) {
    if (msg.type === 'SIGN_CONNECT') {
      return
    }

    if (msg.control) {
      return this.handleContenScriptMessage(msg, sender)
    }

    // NOTE: To account for clicks etc. we need to record the frameId
    // and url to later target the frame in playback
    msg.frameId = sender ? sender.frameId : null
    msg.frameUrl = sender ? sender.url : null

    if (!this._isPaused) {
      this._recording.push(msg)
      chrome.storage.local.set({ recording: this._recording }, () => {
        console.debug('stored recording updated')
      })
    }
  }

  handleContenScriptMessage(msg) {
    if (msg.control === controlMessages.EVENT_RECORDER_STARTED) {
      badge.setText(this._badgeState)
    }

    if (msg.control === controlMessages.GET_VIEWPORT_SIZE) {
      this.recordCurrentViewportSize(msg.coordinates)
    }

    if (msg.control === controlMessages.GET_CURRENT_URL) {
      this.recordCurrentUrl(msg.href)
    }

    if (msg.control === controlMessages.GET_SCREENSHOT) {
      this.recordScreenshot(msg.value)
    }

    if (msg.control === controlMessages.OVERLAY_STOP) {
      chrome.storage.local.set({ clear: true })
      chrome.storage.local.set({ pause: false })
      this.stop()
    }

    if (msg.control === controlMessages.OVERLAY_PAUSE) {
      chrome.storage.local.set({ pause: !this._isPaused })
      this._isPaused ? this.unPause() : this.pause()
    }

    if (msg.control === controlMessages.OVERLAY_CLIPPED_SCREENSHOT) {
      this.toggleScreenShotMode(uiActions.TOGGLE_SCREENSHOT_CLIPPED_MODE)
    }

    if (msg.control === controlMessages.OVERLAY_FULL_SCREENSHOT) {
      this.toggleScreenShotMode(uiActions.TOGGLE_SCREENSHOT_MODE)
    }

    if (msg.control === controlMessages.OVERLAY_ABORT_SCREENSHOT) {
      this.toggleScreenShotMode(uiActions.CLOSE_SCREENSHOT_MODE)
    }

    if (msg.control === controlMessages.RESTART) {
      this.start()
    }
  }

  toggleScreenShotMode(action) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action })
    })
  }
}
