import badge from '@/services/badge'
import browser from '@/services/browser'
import { uiActions, controlMessages, headlessActions } from '@/services/constants'
class RecordingController {
  constructor() {
    this._recording = []
    this._boundedMessageHandler = null
    this._boundedNavigationHandler = null
    this._boundedWaitHandler = null
    this._boundedKeyCommandHandler = null
    this._badgeState = ''
    this._isPaused = false

    // Some events are sent double on page navigations to simplify the event recorder.
    // We keep some simple state to disregard events if needed.
    this._hasGoto = false
    this._hasViewPort = false

    this._menuId = 'PUPPETEER_RECORDER_CONTEXT_MENU'
    this._menuOptions = {
      SCREENSHOT: 'SCREENSHOT',
      SCREENSHOT_CLIPPED: 'SCREENSHOT_CLIPPED',
    }
  }

  boot() {
    chrome.extension.onConnect.addListener(port => {
      console.debug('listeners connected')
      port.onMessage.addListener(msg => {
        if (msg?.action === uiActions.START) {
          this.start()
        }
        if (msg?.action === uiActions.STOP) {
          this.stop()
        }
        if (msg?.action === uiActions.CLEAN_UP) {
          this.cleanUp()
        }
        if (msg?.action === uiActions.PAUSE) {
          chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { action: uiActions.PAUSE })
          })
          this.pause()
        }
        if (msg?.action === uiActions.UN_PAUSE) {
          chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { action: uiActions.UN_PAUSE })
          })
          this.unPause()
        }
      })
    })
  }

  start() {
    console.debug('start recording')
    this.cleanUp(() => {
      this._badgeState = ''

      this._hasGoto = false
      this._hasViewPort = false

      browser.injectContentScript()

      this._boundedMessageHandler = this.handleMessage.bind(this)
      this._boundedNavigationHandler = this.handleNavigation.bind(this)
      this._boundedWaitHandler = badge.setWait

      chrome.runtime.onMessage.addListener(this._boundedMessageHandler)
      chrome.webNavigation.onCompleted.addListener(this._boundedNavigationHandler)
      chrome.webNavigation.onBeforeNavigate.addListener(this._boundedWaitHandler)

      badge.setRecording()

      this._boundedKeyCommandHandler = this.handleKeyCommands.bind(this)
      chrome.commands.onCommand.addListener(this._boundedKeyCommandHandler)
    })
  }

  stop() {
    console.debug('stop recording')
    this._badgeState = this._recording.length > 0 ? '1' : ''

    chrome.runtime.onMessage.removeListener(this._boundedMessageHandler)
    chrome.webNavigation.onCompleted.removeListener(this._boundedNavigationHandler)
    chrome.webNavigation.onBeforeNavigate.removeListener(this._boundedWaitHandler)

    badge.setResult(this._badgeState)

    chrome.storage.local.set({ recording: this._recording }, () => {
      console.debug('recording stored')
    })

    browser.sendContenScriptMessage({ action: uiActions.TOGGLE_OVERLAY, value: false })
  }

  pause() {
    console.debug('pause')
    badge.setPause()
    this._isPaused = true
  }

  unPause() {
    console.debug('unpause')
    badge.setRecording()
    this._isPaused = false
  }

  cleanUp(cb) {
    console.debug('cleanup')
    this._recording = []
    badge.setResult()
    chrome.storage.local.remove('recording', () => {
      console.debug('stored recording cleared')
      if (cb) cb()
    })
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
      return this.handleContentScriptMessages(msg, sender)
    }

    if (msg.type === 'SIGN_CONNECT') {
      return
    }

    // to account for clicks etc. we need to record the frameId and url to later target the frame in playback
    msg.frameId = sender ? sender.frameId : null
    msg.frameUrl = sender ? sender.url : null

    if (!this._isPaused) {
      this._recording.push(msg)
      chrome.storage.local.set({ recording: this._recording }, () => {
        console.debug('stored recording updated')
      })
    }
  }

  handleContentScriptMessages(msg) {
    if (msg.control === controlMessages.EVENT_RECORDER_STARTED) {
      chrome.browserAction.setBadgeText({ text: this._badgeState })
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

    if (msg.control === controlMessages.RESTART) {
      this.start()
    }

    this.handleOverlayMessages(msg)
  }

  handleOverlayMessages(msg) {
    if (msg.control === controlMessages.OVERLAY_STOP) {
      chrome.storage.local.set({ clear: true })
      this.stop()
    }

    if (msg.control === controlMessages.OVERLAY_PAUSE) {
      chrome.storage.local.set({ pause: this._isPaused ? false : true })
      this._isPaused ? this.unPause() : this.pause()
    }

    if (msg.control === controlMessages.OVERLAY_CLIPPED_SCREENSHOT) {
      browser.sendContenScriptMessage({ action: uiActions.TOGGLE_SCREENSHOT_CLIPPED_MODE })
    }

    if (msg.control === controlMessages.OVERLAY_FULL_SCREENSHOT) {
      browser.sendContenScriptMessage({ action: uiActions.TOGGLE_SCREENSHOT_MODE })
    }

    if (msg.control === controlMessages.OVERLAY_ABORT_SCREENSHOT) {
      browser.sendContenScriptMessage({ action: uiActions.CLOSE_SCREENSHOT_MODE })
    }
  }

  handleNavigation({ frameId }) {
    console.debug('frameId is:', frameId)
    browser.injectContentScript()
    if (frameId === 0) {
      this.recordNavigation()
    }
  }

  handleKeyCommands(action) {
    if (action === uiActions.TOGGLE_SCREENSHOT_MODE) {
      browser.sendContenScriptMessage({ action: uiActions.TOGGLE_SCREENSHOT_MODE })
    }

    if (action === uiActions.TOGGLE_SCREENSHOT_CLIPPED_MODE) {
      browser.sendContenScriptMessage({ action: uiActions.TOGGLE_SCREENSHOT_CLIPPED_MODE })
    }
  }
}

window.recordingController = new RecordingController()
window.recordingController.boot()
