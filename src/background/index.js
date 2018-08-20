class RecordingController {
  constructor () {
    this._recording = []
    this._boundedMessageHandler = null
    this._boundedNavigationHandler = null
    this._boundedWaitHandler = null
    this._scriptInjected = false
    this._badgeState = ''
    this._isPaused = false
  }

  boot () {
    chrome.extension.onConnect.addListener(port => {
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
    this._badgeState = 'rec'

    // if (!this._scriptInjected) {
    chrome.tabs.executeScript({file: 'content-script.js'})
    // this._scriptInjected = true
    // }

    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { control: 'get-viewport-size' }, response => {
        if (response) this.recordCurrentViewportSize(response.value)
      })
      chrome.tabs.sendMessage(tabs[0].id, { control: 'get-current-url' }, response => {
        if (response) this.recordCurrentUrl(response.href)
      })
    })

    this._boundedMessageHandler = this.handleMessage.bind(this)
    this._boundedNavigationHandler = this.handleNavigation.bind(this)
    this._boundedWaitHandler = this.handleWait.bind(this)

    chrome.runtime.onMessage.addListener(this._boundedMessageHandler)
    chrome.webNavigation.onCompleted.addListener(this._boundedNavigationHandler)
    chrome.webNavigation.onBeforeNavigate.addListener(this._boundedWaitHandler)

    chrome.browserAction.setIcon({ path: './images/icon-green.png' })
    chrome.browserAction.setBadgeText({ text: this._badgeState })
    chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000' })
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

  cleanUp () {
    console.debug('cleanup')
    this._recording = []
    chrome.browserAction.setBadgeText({ text: '' })
    chrome.storage.local.remove('recording', () => {
      console.debug('stored recording cleared')
    })
  }

  recordCurrentUrl (href) {
    this.handleMessage({ selector: undefined, value: undefined, action: 'goto*', href })
  }

  recordCurrentViewportSize (value) {
    this.handleMessage({ selector: undefined, value, action: 'viewport*' })
  }

  recordNavigation () {
    this.handleMessage({ selector: undefined, value: undefined, action: 'navigation*' })
  }

  handleMessage (msg) {
    console.debug('receiving message', msg)
    if (msg.control) return this.handleControlMessage(msg)

    if (!this._isPaused) {
      this._recording.push(msg)
      chrome.storage.local.set({ recording: this._recording }, () => {
        console.debug('stored recording updated')
      })
    }
  }

  handleControlMessage (msg) {
    if (msg.control === 'event-recorder-started') chrome.browserAction.setBadgeText({ text: this._badgeState })
  }

  handleNavigation ({ frameId }) {
    console.debug('frameId is:', frameId)
    if (frameId === 0) {
      chrome.tabs.executeScript({file: 'content-script.js'})
      this.recordNavigation()
    }
  }

  handleWait () {
    chrome.browserAction.setBadgeText({ text: 'wait' })
  }
}

console.debug('booting recording controller')
window.recordingController = new RecordingController()
window.recordingController.boot()
