import pptrActions from '../code-generator/pptr-actions'

class RecordingController {
  constructor () {
    this._recording = []
    this._boundedMessageHandler = null
    this._boundedNavigationHandler = null
    this._boundedWaitHandler = null
    this._badgeState = ''
    this._isPaused = false

    // Some events are sent double on page navigations to simplify the event recorder.
    // We keep some simple state to disregard events if needed.
    this._hasGoto = false
    this._hasViewPort = false
  }

  boot () {
    chrome.extension.onConnect.addListener(port => {
      console.debug('listeners connected')
      port.onMessage.addListener(msg => {
        if (msg.action && msg.action === 'start') this.start()
        if (msg.action && msg.action === 'stop') this.stop()
        if (msg.action && msg.action === 'cleanUp') this.cleanUp()
        if (msg.action && msg.action === 'pause') this.pause()
        if (msg.action && msg.action === 'unpause') this.unPause()
      })
    })
  }

  start () {
    console.debug('start recording')
    this.cleanUp(() => {
      this._badgeState = 'rec'

      this._hasGoto = false
      this._hasViewPort = false

      this.injectScript()

      this._boundedMessageHandler = this.handleMessage.bind(this)
      this._boundedNavigationHandler = this.handleNavigation.bind(this)
      this._boundedWaitHandler = this.handleWait.bind(this)

      chrome.runtime.onMessage.addListener(this._boundedMessageHandler)
      chrome.webNavigation.onCompleted.addListener(this._boundedNavigationHandler)
      chrome.webNavigation.onBeforeNavigate.addListener(this._boundedWaitHandler)

      chrome.browserAction.setIcon({ path: './images/icon-green.png' })
      chrome.browserAction.setBadgeText({ text: this._badgeState })
      chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000' })
    })
  }

  stop () {
    console.debug('stop recording')
    this._badgeState = this._recording.length > 0 ? '1' : ''

    chrome.runtime.onMessage.removeListener(this._boundedMessageHandler)
    chrome.webNavigation.onCompleted.removeListener(this._boundedNavigationHandler)
    chrome.webNavigation.onBeforeNavigate.removeListener(this._boundedWaitHandler)

    chrome.browserAction.setIcon({ path: './images/icon-black.png' })
    chrome.browserAction.setBadgeText({text: this._badgeState})
    chrome.browserAction.setBadgeBackgroundColor({color: '#45C8F1'})

    chrome.storage.local.set({ recording: this._recording }, () => {
      console.debug('recording stored')
    })
  }

  pause () {
    console.debug('pause')
    this._badgeState = '❚❚'
    chrome.browserAction.setBadgeText({ text: this._badgeState })
    this._isPaused = true
  }

  unPause () {
    console.debug('unpause')
    this._badgeState = 'rec'
    chrome.browserAction.setBadgeText({ text: this._badgeState })
    this._isPaused = false
  }

  cleanUp (cb) {
    console.debug('cleanup')
    this._recording = []
    chrome.browserAction.setBadgeText({ text: '' })
    chrome.storage.local.remove('recording', () => {
      console.debug('stored recording cleared')
      if (cb) cb()
    })
  }

  recordCurrentUrl (href) {
    if (!this._hasGoto) {
      console.debug('recording goto* for:', href)
      this.handleMessage({selector: undefined, value: undefined, action: pptrActions.GOTO, href})
      this._hasGoto = true
    }
  }

  recordCurrentViewportSize (value) {
    if (!this._hasViewPort) {
      this.handleMessage({selector: undefined, value, action: pptrActions.VIEWPORT})
      this._hasViewPort = true
    }
  }

  recordNavigation () {
    this.handleMessage({ selector: undefined, value: undefined, action: pptrActions.NAVIGATION })
  }

  handleMessage (msg, sender) {
    if (msg.control) return this.handleControlMessage(msg, sender)

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

  handleControlMessage (msg, sender) {
    if (msg.control === 'event-recorder-started') chrome.browserAction.setBadgeText({ text: this._badgeState })
    if (msg.control === 'get-viewport-size') this.recordCurrentViewportSize(msg.coordinates)
    if (msg.control === 'get-current-url') this.recordCurrentUrl(msg.href)
  }

  handleNavigation ({ frameId }) {
    console.debug('frameId is:', frameId)
    this.injectScript()
    if (frameId === 0) {
      this.recordNavigation()
    }
  }

  handleWait () {
    chrome.browserAction.setBadgeText({ text: 'wait' })
  }

  injectScript () {
    chrome.tabs.executeScript({ file: 'content-script.js', allFrames: true })
  }
}

console.debug('booting recording controller')
window.recordingController = new RecordingController()
window.recordingController.boot()
