import badge from '@/services/badge'
import browser from '@/services/browser'
import storage from '@/services/storage'
import { uiActions, overlayActions, controlMessages, headlessActions } from '@/services/constants'

import CodeGenerator from '@/modules/code-generator'

class Background {
  constructor() {
    this._recording = []
    this._boundedMessageHandler = null
    this._boundedNavigationHandler = null
    this._boundedWaitHandler = null

    this.overlayHandler = null

    this._badgeState = ''
    this._isPaused = false

    // Some events are sent double on page navigations to simplify the event recorder.
    // We keep some simple state to disregard events if needed.
    this._hasGoto = false
    this._hasViewPort = false
  }

  init() {
    chrome.extension.onConnect.addListener(port => {
      port.onMessage.addListener(msg => this.handlePopupMessage(msg))
    })
  }

  async start() {
    await this.cleanUp()

    this._badgeState = ''
    this._hasGoto = false
    this._hasViewPort = false

    await browser.injectContentScript()
    this.toggleOverlay({ open: true, clear: true })

    this._boundedMessageHandler = this.handleMessage.bind(this)
    this._boundedNavigationHandler = this.handleNavigation.bind(this)
    this._boundedWaitHandler = () => badge.wait()

    this.overlayHandler = this.handleOverlayMessage.bind(this)

    chrome.runtime.onMessage.addListener(this._boundedMessageHandler)
    chrome.runtime.onMessage.addListener(this.overlayHandler)

    chrome.webNavigation.onCompleted.addListener(this._boundedNavigationHandler)
    chrome.webNavigation.onBeforeNavigate.addListener(this._boundedWaitHandler)

    badge.start()
  }

  stop() {
    this._badgeState = this._recording.length > 0 ? '1' : ''

    chrome.runtime.onMessage.removeListener(this._boundedMessageHandler)
    chrome.webNavigation.onCompleted.removeListener(this._boundedNavigationHandler)
    chrome.webNavigation.onBeforeNavigate.removeListener(this._boundedWaitHandler)

    badge.stop(this._badgeState)

    chrome.storage.local.set({ recording: this._recording })
  }

  pause() {
    badge.pause()
    this._isPaused = true
  }

  unPause() {
    badge.start()
    this._isPaused = false
  }

  cleanUp() {
    this._recording = []
    badge.reset()

    return new Promise(function(resolve) {
      chrome.storage.local.remove('recording', () => resolve())
    })
  }

  recordCurrentUrl(href) {
    if (!this._hasGoto) {
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

  recordNavigation() {
    this.handleMessage({
      selector: undefined,
      value: undefined,
      action: headlessActions.NAVIGATION,
    })
  }

  recordScreenshot(value) {
    this.handleMessage({
      selector: undefined,
      value,
      action: headlessActions.SCREENSHOT,
    })
  }

  handleMessage(msg, sender) {
    if (msg.control) {
      return this.handleContenScriptMessage(msg, sender)
    }

    if (msg.type === 'SIGN_CONNECT') {
      return
    }

    // NOTE: To account for clicks etc. we need to record the frameId
    // and url to later target the frame in playback
    msg.frameId = sender ? sender.frameId : null
    msg.frameUrl = sender ? sender.url : null

    if (!this._isPaused) {
      this._recording.push(msg)
      chrome.storage.local.set({ recording: this._recording })
    }
  }

  async handleOverlayMessage(msg) {
    if (!msg.control) {
      return
    }

    if (msg.control === overlayActions.RESTART) {
      chrome.storage.local.set({ restart: true })
      this.start()
    }

    if (msg.control === overlayActions.CLOSE) {
      this.toggleOverlay()
      chrome.runtime.onMessage.removeListener(this.overlayHandler)
    }

    if (msg.control === overlayActions.COPY) {
      const { options = {} } = storage.get(['options'])
      const generator = new CodeGenerator(options)
      const code = generator.generate(this._recording)

      browser.sendTabMessage({
        action: 'CODE',
        value: !options?.code?.showPlaywrightFirst ? code.puppeteer : code.playwright,
      })
    }

    if (msg.control === controlMessages.OVERLAY_STOP) {
      chrome.storage.local.set({ clear: true })
      chrome.storage.local.set({ pause: false })
      this.stop()
    }

    if (msg.control === controlMessages.OVERLAY_UNPAUSE) {
      chrome.storage.local.set({ pause: false })
      this.unPause()
    }

    if (msg.control === controlMessages.OVERLAY_PAUSE) {
      chrome.storage.local.set({ pause: true })
      this.pause()
    }

    if (msg.control === controlMessages.OVERLAY_CLIPPED_SCREENSHOT) {
      browser.sendTabMessage({ action: uiActions.TOGGLE_SCREENSHOT_CLIPPED_MODE })
    }

    if (msg.control === controlMessages.OVERLAY_FULL_SCREENSHOT) {
      browser.sendTabMessage({ action: uiActions.TOGGLE_SCREENSHOT_MODE })
    }

    if (msg.control === controlMessages.OVERLAY_ABORT_SCREENSHOT) {
      browser.sendTabMessage({ action: uiActions.CLOSE_SCREENSHOT_MODE })
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

    // if (msg.control === controlMessages.RESTART) {
    //   this.start()
    // }
  }

  handlePopupMessage(msg) {
    if (!msg.action) {
      return
    }

    if (msg.action === uiActions.START) {
      this.start()
    }

    if (msg.action === uiActions.STOP) {
      browser.sendTabMessage({ action: uiActions.STOP })
      this.stop()
    }

    if (msg.action === uiActions.CLEAN_UP) {
      msg.value && this.stop()
      this.toggleOverlay()
      this.cleanUp()
    }

    if (msg.action === uiActions.PAUSE) {
      if (!msg.stop) {
        browser.sendTabMessage({ action: uiActions.PAUSE })
      }
      this.pause()
    }

    if (msg.action === uiActions.UN_PAUSE) {
      if (!msg.stop) {
        browser.sendTabMessage({ action: uiActions.UN_PAUSE })
      }
      this.unPause()
    }
  }

  async handleNavigation({ frameId }) {
    await browser.injectContentScript()
    this.toggleOverlay({ open: true, pause: this._isPaused })

    if (frameId === 0) {
      this.recordNavigation()
    }
  }

  toggleOverlay({ open = false, clear = false, pause = false } = {}) {
    browser.sendTabMessage({ action: uiActions.TOGGLE_OVERLAY, value: { open, clear, pause } })
  }
}

window.headlessRecorder = new Background()
window.headlessRecorder.init()
