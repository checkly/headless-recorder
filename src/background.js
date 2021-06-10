import {
  uiActions,
  controlMessages,
  headlessActions,
} from '@/services/constants'
class RecordingController {
  constructor() {
    this._recording = []
    this._boundedMessageHandler = null
    this._boundedNavigationHandler = null
    this._boundedWaitHandler = null
    this._boundedMenuHandler = null
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
        if (msg.action && msg.action === uiActions.START) {
          this.start()
        }
        if (msg.action && msg.action === uiActions.STOP) {
          this.stop()
        }
        if (msg.action && msg.action === uiActions.CLEAN_UP) {
          this.cleanUp()
        }
        if (msg.action && msg.action === uiActions.PAUSE) {
          chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { action: uiActions.PAUSE })
          })
          this.pause()
        }
        if (msg.action && msg.action === uiActions.UN_PAUSE) {
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

      this.injectScript()

      this._boundedMessageHandler = this.handleMessage.bind(this)
      this._boundedNavigationHandler = this.handleNavigation.bind(this)
      this._boundedWaitHandler = this.handleWait.bind(this)

      chrome.runtime.onMessage.addListener(this._boundedMessageHandler)
      chrome.webNavigation.onCompleted.addListener(
        this._boundedNavigationHandler
      )
      chrome.webNavigation.onBeforeNavigate.addListener(
        this._boundedWaitHandler
      )

      chrome.browserAction.setIcon({ path: './images/logo-red.png' })
      chrome.contextMenus.removeAll()

      chrome.contextMenus.create({
        id: this._menuId,
        title: 'Headless Recorder',
        contexts: ['all'],
      })

      chrome.contextMenus.create({
        id: this._menuId + this._menuOptions.SCREENSHOT,
        title: 'Take Screenshot (Ctrl+Shift+A)',
        parentId: this._menuId,
        contexts: ['all'],
      })

      chrome.contextMenus.create({
        id: this._menuId + this._menuOptions.SCREENSHOT_CLIPPED,
        title: 'Take Screenshot Clipped (Ctrl+Shift+S)',
        parentId: this._menuId,
        contexts: ['all'],
      })

      this._boundedMenuHandler = this.handleMenuInteraction.bind(this)
      chrome.contextMenus.onClicked.addListener(this._boundedMenuHandler)

      this._boundedKeyCommandHandler = this.handleKeyCommands.bind(this)
      chrome.commands.onCommand.addListener(this._boundedKeyCommandHandler)
    })
  }

  stop() {
    console.debug('stop recording')
    this._badgeState = this._recording.length > 0 ? '1' : ''

    chrome.runtime.onMessage.removeListener(this._boundedMessageHandler)
    chrome.webNavigation.onCompleted.removeListener(
      this._boundedNavigationHandler
    )
    chrome.webNavigation.onBeforeNavigate.removeListener(
      this._boundedWaitHandler
    )
    chrome.contextMenus.onClicked.removeListener(this._boundedMenuHandler)

    chrome.browserAction.setIcon({ path: './images/logo.png' })
    chrome.browserAction.setBadgeText({ text: this._badgeState })
    chrome.browserAction.setBadgeBackgroundColor({ color: '#45C8F1' })

    chrome.storage.local.set({ recording: this._recording }, () => {
      console.debug('recording stored')
    })

    this.toggleSelectorHelper()
  }

  pause() {
    console.debug('pause')
    chrome.browserAction.setIcon({ path: './images/logo-yellow.png' })
    this._isPaused = true
  }

  unPause() {
    console.debug('unpause')
    chrome.browserAction.setIcon({ path: './images/logo-red.png' })
    this._isPaused = false
  }

  cleanUp(cb) {
    console.debug('cleanup')
    this._recording = []
    chrome.browserAction.setBadgeText({ text: '' })
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
      return this.handleControlMessage(msg, sender)
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

  handleControlMessage(msg) {
    // Handle events from content-script
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

    if (msg.control === controlMessages.OVERLAY_STOP) {
      chrome.storage.local.set({ clear: true })
      this.stop()
    }

    if (msg.control === controlMessages.OVERLAY_PAUSE) {
      chrome.storage.local.set({ pause: true })
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

  handleNavigation({ frameId }) {
    console.debug('frameId is:', frameId)
    this.injectScript()
    if (frameId === 0) {
      this.recordNavigation()
    }
  }

  handleMenuInteraction(info) {
    console.debug('context menu clicked')
    switch (info.menuItemId) {
      case this._menuId + this._menuOptions.SCREENSHOT:
        this.toggleScreenShotMode(uiActions.TOGGLE_SCREENSHOT_MODE)
        break
      case this._menuId + this._menuOptions.SCREENSHOT_CLIPPED:
        this.toggleScreenShotMode(uiActions.TOGGLE_SCREENSHOT_CLIPPED_MODE)
        break
    }
  }

  handleKeyCommands(command) {
    switch (command) {
      case uiActions.TOGGLE_SCREENSHOT_MODE:
        this.toggleScreenShotMode(uiActions.TOGGLE_SCREENSHOT_MODE)
        break
      case uiActions.TOGGLE_SCREENSHOT_CLIPPED_MODE:
        this.toggleScreenShotMode(uiActions.TOGGLE_SCREENSHOT_CLIPPED_MODE)
        break
    }
  }

  toggleScreenShotMode(action) {
    console.debug('toggling screenshot mode')
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action })
    })
  }

  handleWait() {
    chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000' })
    chrome.browserAction.setBadgeText({ text: 'wait' })
  }

  injectScript() {
    chrome.tabs.executeScript(
      { file: 'js/content-script.js', allFrames: false },
      () => {
        this.toggleSelectorHelper(true)
      }
    )
  }

  toggleSelectorHelper(value = false) {
    console.debug('toggling overlay')
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: uiActions.TOGGLE_OVERLAY,
        value,
      })
    })
  }
}

console.debug('booting recording controller')
window.recordingController = new RecordingController()
window.recordingController.boot()
