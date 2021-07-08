import badge from '@/services/badge'
import browser from '@/services/browser'
import storage from '@/services/storage'
import { popupActions, recordingControls } from '@/services/constants'
import { overlayActions } from '@/modules/overlay/constants'
import { headlessActions } from '@/modules/code-generator/constants'

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

    this._menuId = 'PUPPETEER_RECORDER_CONTEXT_MENU'
    this._boundedMenuHandler = null

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

    // chrome.contextMenus.create({
    //   id: this._menuId,
    //   title: 'Headless Recorder',
    //   contexts: ['all'],
    // })

    // chrome.contextMenus.create({
    //   id: this._menuId + 'SELECTOR',
    //   title: 'Copy Selector',
    //   parentId: this._menuId,
    //   contexts: ['all'],
    // })

    // this._boundedMenuHandler = this.handleMenuInteraction.bind(this)
    // chrome.contextMenus.onClicked.addListener(this._boundedMenuHandler)

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
    // chrome.contextMenus.onClicked.removeListener(this._boundedMenuHandler)

    badge.stop(this._badgeState)

    storage.set({ recording: this._recording })
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
    this._isPaused = false
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

  // handleMenuInteraction(info, tab) {
  // }

  handleMessage(msg, sender) {
    if (msg.control) {
      return this.handleRecordingMessage(msg, sender)
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
      storage.set({ recording: this._recording })
    }
  }

  async handleOverlayMessage({ control }) {
    if (!control) {
      return
    }

    if (control === overlayActions.RESTART) {
      chrome.storage.local.set({ restart: true })
      chrome.storage.local.set({ clear: false })
      chrome.runtime.onMessage.removeListener(this.overlayHandler)
      this.stop()
      this.cleanUp()
      this.start()
    }

    if (control === overlayActions.CLOSE) {
      this.toggleOverlay()
      chrome.runtime.onMessage.removeListener(this.overlayHandler)
    }

    if (control === overlayActions.COPY) {
      const { options = {} } = storage.get(['options'])
      const generator = new CodeGenerator(options)
      const code = generator.generate(this._recording)

      browser.sendTabMessage({
        action: 'CODE',
        value: !options?.code?.showPlaywrightFirst ? code.puppeteer : code.playwright,
      })
    }

    if (control === overlayActions.STOP) {
      chrome.storage.local.set({ clear: true })
      chrome.storage.local.set({ pause: false })
      chrome.storage.local.set({ restart: false })
      this.stop()
    }

    if (control === overlayActions.UNPAUSE) {
      chrome.storage.local.set({ pause: false })
      this.unPause()
    }

    if (control === overlayActions.PAUSE) {
      chrome.storage.local.set({ pause: true })
      this.pause()
    }

    // TODO: the next 3 events do not need to be listened in background
    // content script controller, should be able to handle that directly from overlay
    if (control === overlayActions.CLIPPED_SCREENSHOT) {
      browser.sendTabMessage({ action: overlayActions.TOGGLE_SCREENSHOT_CLIPPED_MODE })
    }

    if (control === overlayActions.FULL_SCREENSHOT) {
      browser.sendTabMessage({ action: overlayActions.TOGGLE_SCREENSHOT_MODE })
    }

    if (control === overlayActions.ABORT_SCREENSHOT) {
      browser.sendTabMessage({ action: overlayActions.CLOSE_SCREENSHOT_MODE })
    }
  }

  handleRecordingMessage({ control, href, value, coordinates }) {
    if (control === recordingControls.EVENT_RECORDER_STARTED) {
      badge.setText(this._badgeState)
    }

    if (control === recordingControls.GET_VIEWPORT_SIZE) {
      this.recordCurrentViewportSize(coordinates)
    }

    if (control === recordingControls.GET_CURRENT_URL) {
      this.recordCurrentUrl(href)
    }

    if (control === recordingControls.GET_SCREENSHOT) {
      this.recordScreenshot(value)
    }
  }

  handlePopupMessage(msg) {
    if (!msg.action) {
      return
    }

    if (msg.action === popupActions.START) {
      this.start()
    }

    if (msg.action === popupActions.STOP) {
      browser.sendTabMessage({ action: popupActions.STOP })
      this.stop()
    }

    if (msg.action === popupActions.CLEAN_UP) {
      chrome.runtime.onMessage.removeListener(this.overlayHandler)
      msg.value && this.stop()
      this.toggleOverlay()
      this.cleanUp()
    }

    if (msg.action === popupActions.PAUSE) {
      if (!msg.stop) {
        browser.sendTabMessage({ action: popupActions.PAUSE })
      }
      this.pause()
    }

    if (msg.action === popupActions.UN_PAUSE) {
      if (!msg.stop) {
        browser.sendTabMessage({ action: popupActions.UN_PAUSE })
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

  // TODO: Use a better naming convention for this arguments
  toggleOverlay({ open = false, clear = false, pause = false } = {}) {
    browser.sendTabMessage({ action: overlayActions.TOGGLE_OVERLAY, value: { open, clear, pause } })
  }
}

window.headlessRecorder = new Background()
window.headlessRecorder.init()
