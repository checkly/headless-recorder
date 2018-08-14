let recording = []
let boundedMessageHandler
let boundedNavigationHandler
let scriptInjected = false

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

  if (!scriptInjected) {
    chrome.tabs.executeScript({file: 'content-script.js'})
    scriptInjected = true
  }
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'get-current-url' }, response => {
      if (response) sendCurrentUrl(response.href)
    })
  })

  boundedMessageHandler = handleEvent.bind(this)
  boundedNavigationHandler = handleNavigation.bind(this)

  chrome.runtime.onMessage.addListener(boundedMessageHandler)
  chrome.webNavigation.onCompleted.addListener(boundedNavigationHandler)
  chrome.browserAction.setIcon({ path: './images/icon-green.png' })
  chrome.browserAction.setBadgeText({ text: 'rec' })
  chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000' })
}

function stop () {
  console.debug('stop recording')
  chrome.runtime.onMessage.removeListener(boundedMessageHandler)
  chrome.webNavigation.onCompleted.removeListener(boundedNavigationHandler)
  chrome.browserAction.setIcon({ path: './images/icon-black.png' })
  chrome.browserAction.setBadgeText({ text: '1' })
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
  // chrome.runtime.reload()
}

function sendCurrentUrl (href) {
  handleEvent({ selector: undefined, value: undefined, action: 'goto*', href })
}

function handleEvent (event) {
  console.debug('receiving event', event)
  recording.push(event)
  chrome.storage.local.set({ recording: recording }, () => {
    console.debug('stored recording updated')
  })
}

function handleNavigation ({ url, frameId }) {
  console.debug(`current frame ${frameId} with url ${url}`)
  if (frameId === 0) {
    chrome.tabs.executeScript({file: 'content-script.js'})
  }
}

console.debug('booting puppeteer-recorder')
boot()
