let recording = []
let boundedMessageHandler
let boundedNavigationHandler
let scriptInjected = false
let badgeState = ''

function boot () {
  chrome.extension.onConnect.addListener(port => {
    port.onMessage.addListener(msg => {
      if (msg.action && msg.action === 'start') start()
      if (msg.action && msg.action === 'stop') stop()
      if (msg.action && msg.action === 'restart') restart()
    })
  })
}

function start () {
  console.debug('start recording')
  badgeState = 'rec'

  if (!scriptInjected) {
    chrome.tabs.executeScript({file: 'content-script.js'})
    scriptInjected = true
  }

  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { control: 'get-current-url' }, response => {
      if (response) recordCurrentUrl(response.href)
    })
  })

  boundedMessageHandler = handleMessage.bind(this)
  boundedNavigationHandler = handleNavigation.bind(this)

  chrome.runtime.onMessage.addListener(boundedMessageHandler)
  chrome.webNavigation.onCompleted.addListener(boundedNavigationHandler)
  chrome.webNavigation.onBeforeNavigate.addListener(() => {
    chrome.browserAction.setBadgeText({ text: 'wait' })
  })
  chrome.browserAction.setIcon({ path: './images/icon-green.png' })
  chrome.browserAction.setBadgeText({ text: badgeState })
  chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000' })
}

function stop () {
  console.debug('stop recording')
  badgeState = '1'

  chrome.runtime.onMessage.removeListener(boundedMessageHandler)
  chrome.webNavigation.onCompleted.removeListener(boundedNavigationHandler)
  chrome.browserAction.setIcon({ path: './images/icon-black.png' })
  chrome.browserAction.setBadgeText({ text: badgeState })
  chrome.browserAction.setBadgeBackgroundColor({ color: '#45C8F1' })
  chrome.storage.local.set({ recording: recording }, () => {
    console.debug('recording stored')
  })
}

function restart () {
  console.debug('restart')
  recording = []
  chrome.browserAction.setBadgeText({ text: '' })
  chrome.storage.local.remove('recording', () => {
    console.debug('stored recording cleared')
  })
}

function recordCurrentUrl (href) {
  handleMessage({ selector: undefined, value: undefined, action: 'goto*', href })
}

function handleMessage (msg) {
  console.debug('receiving message', msg)
  if (msg.control) {
    handleControlMessage(msg)
  } else {
    recording.push(msg)
    chrome.storage.local.set({ recording: recording }, () => {
      console.debug('stored recording updated')
    })
  }
}

function handleControlMessage (msg) {
  if (msg.control === 'event-recorder-started') chrome.browserAction.setBadgeText({ text: badgeState })
}

function handleNavigation ({ url, frameId }) {
  console.debug(`current frame ${frameId} with url ${url}`)
  if (frameId === 0) {
    chrome.tabs.executeScript({file: 'content-script.js'})
  }
}

console.debug('booting puppeteer-recorder')
boot()
