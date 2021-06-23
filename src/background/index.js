import badge from '@/services/badge'
// import browser from '@/services/browser'
import { uiActions, headlessActions } from '@/services/constants'

import H from './handler'

const CONTENT_SCRIPT_PATH = 'js/content-script.js'
class Background {
  constructor(h) {
    this._recording = []
    this._boundedNavigationHandler = null
    this._boundedWaitHandler = null

    this._badgeState = ''
    this._isPaused = false

    // Some events are sent double on page navigations to simplify the event recorder.
    // We keep some simple state to disregard events if needed.
    this._hasGoto = false
    this._hasViewPort = false

    this.h = h
  }

  init() {
    chrome.extension.onConnect.addListener(port => {
      console.debug('listeners connected')
      port.onMessage.addListener(msg => {
        if (!msg.action) {
          return
        }

        if (msg.action === uiActions.START) {
          this.start()
        }

        if (msg.action === uiActions.STOP) {
          this.stop()
        }

        if (msg.action === uiActions.CLEAN_UP) {
          this.cleanUp()
        }

        if (msg.action === uiActions.PAUSE) {
          chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { action: uiActions.PAUSE })
          })
          this.pause()
        }

        if (msg.action === uiActions.UN_PAUSE) {
          chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { action: uiActions.UN_PAUSE })
          })
          this.unPause()
        }
      })
    })
  }

  start() {
    this.cleanUp(() => {
      this._badgeState = ''
      this._hasGoto = false
      this._hasViewPort = false

      this.injectContentScript()

      this._boundedNavigationHandler = this.handleNavigation.bind(this)
      this._boundedWaitHandler = () => badge.wait()

      chrome.webNavigation.onCompleted.addListener(this._boundedNavigationHandler)
      chrome.webNavigation.onBeforeNavigate.addListener(this._boundedWaitHandler)

      badge.start()
      this.h.start()
    })
  }

  stop() {
    console.debug('stop recording')
    this._badgeState = this._recording.length > 0 ? '1' : ''

    chrome.webNavigation.onCompleted.removeListener(this._boundedNavigationHandler)
    chrome.webNavigation.onBeforeNavigate.removeListener(this._boundedWaitHandler)

    badge.stop(this._badgeState)
    this.h.stop()

    chrome.storage.local.set({ recording: this._recording }, () => {
      console.debug('recording stored')
    })
  }

  pause() {
    badge.pause()
    this._isPaused = true
  }

  unPause() {
    badge.start()
    this._isPaused = false
  }

  cleanUp(cb) {
    this._recording = []
    badge.reset()

    chrome.storage.local.remove('recording', () => cb && cb())
  }

  handleNavigation({ frameId }) {
    this.injectContentScript()

    if (frameId === 0) {
      this.recordNavigation()
    }
  }

  injectContentScript() {
    chrome.tabs.executeScript({ file: CONTENT_SCRIPT_PATH, allFrames: false }, () => {
      this.toggleOverlay(true)
    })
  }

  toggleOverlay(value = false) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: uiActions.TOGGLE_OVERLAY,
        value,
      })
    })
  }

  recordNavigation() {
    this.handleMessage({
      selector: undefined,
      value: undefined,
      action: headlessActions.NAVIGATION,
    })
  }
}

window.headlessRecorder = new Background(new H())
window.headlessRecorder.init()
