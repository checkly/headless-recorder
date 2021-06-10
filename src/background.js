import pptrActions from '@/services/pptr-actions'
import ctrl from '@/models/extension-control-messages'
import actions from '@/models/extension-ui-actions'

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
        if (msg.action && msg.action === actions.START) {
          this.start()
        }
        if (msg.action && msg.action === actions.STOP) {
          this.stop()
        }
        if (msg.action && msg.action === actions.CLEAN_UP) {
          this.cleanUp()
        }
        if (msg.action && msg.action === actions.PAUSE) {
          chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { action: actions.PAUSE })
          })
          this.pause()
        }
        if (msg.action && msg.action === actions.UN_PAUSE) {
          chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { action: actions.UN_PAUSE })
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
        action: pptrActions.GOTO,
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
        action: pptrActions.VIEWPORT,
      })
      this._hasViewPort = true
    }
  }

  recordNavigation() {
    this.handleMessage({
      selector: undefined,
      value: undefined,
      action: pptrActions.NAVIGATION,
    })
  }

  recordScreenshot(value) {
    this.handleMessage({
      selector: undefined,
      value,
      action: pptrActions.SCREENSHOT,
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
    if (msg.control === ctrl.EVENT_RECORDER_STARTED) {
      chrome.browserAction.setBadgeText({ text: this._badgeState })
    }
    if (msg.control === ctrl.GET_VIEWPORT_SIZE) {
      this.recordCurrentViewportSize(msg.coordinates)
    }
    if (msg.control === ctrl.GET_CURRENT_URL) {
      this.recordCurrentUrl(msg.href)
    }
    if (msg.control === ctrl.GET_SCREENSHOT) {
      this.recordScreenshot(msg.value)
    }

    if (msg.control === ctrl.OVERLAY_STOP) {
      chrome.storage.local.set({ clear: true })
      this.stop()
    }

    if (msg.control === ctrl.OVERLAY_PAUSE) {
      chrome.storage.local.set({ pause: true })
      this._isPaused ? this.unPause() : this.pause()
    }

    if (msg.control === ctrl.OVERLAY_CLIPPED_SCREENSHOT) {
      this.toggleScreenShotMode(actions.TOGGLE_SCREENSHOT_CLIPPED_MODE)
    }

    if (msg.control === ctrl.OVERLAY_FULL_SCREENSHOT) {
      this.toggleScreenShotMode(actions.TOGGLE_SCREENSHOT_MODE)
    }

    if (msg.control === ctrl.OVERLAY_ABORT_SCREENSHOT) {
      this.toggleScreenShotMode(actions.CLOSE_SCREENSHOT_MODE)
    }

    if (msg.control === ctrl.RESTART) {
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
        this.toggleScreenShotMode(actions.TOGGLE_SCREENSHOT_MODE)
        break
      case this._menuId + this._menuOptions.SCREENSHOT_CLIPPED:
        this.toggleScreenShotMode(actions.TOGGLE_SCREENSHOT_CLIPPED_MODE)
        break
    }
  }

  handleKeyCommands(command) {
    switch (command) {
      case actions.TOGGLE_SCREENSHOT_MODE:
        this.toggleScreenShotMode(actions.TOGGLE_SCREENSHOT_MODE)
        break
      case actions.TOGGLE_SCREENSHOT_CLIPPED_MODE:
        this.toggleScreenShotMode(actions.TOGGLE_SCREENSHOT_CLIPPED_MODE)
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
        action: actions.TOGGLE_OVERLAY,
        value,
      })
    })
  }
}

console.debug('booting recording controller')
window.recordingController = new RecordingController()
window.recordingController.boot()
