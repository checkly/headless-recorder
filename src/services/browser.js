import { uiActions } from '@/services/constants'
const BUS_NAME = 'recordControls'

function getActiveTab() {
  return new Promise(resolve =>
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => resolve(tab))
  )
}

async function sendContenScriptMessage({ action, value = null }) {
  console.debug('sendContenScriptMessage =>', action, value)
  const tab = await getActiveTab()
  chrome.tabs.sendMessage(tab.id, { action, value })
}

function injectContentScript() {
  chrome.tabs.executeScript({ file: 'js/content-script.js', allFrames: false }, () =>
    sendContenScriptMessage({ action: uiActions.TOGGLE_OVERLAY, value: true })
  )
}

function getChecklyCookie() {
  return new Promise(function(resolve) {
    chrome.cookies.getAll({}, cookies => {
      resolve(cookies.find(cookie => cookie.name.startsWith('checkly_has_account')))
    })
  })
}

function openOptions() {
  chrome.runtime.openOptionsPage && chrome.runtime.openOptionsPage()
}

function getBus() {
  return chrome.extension.connect({ name: BUS_NAME })
}

function getPopupConnection() {
  return new Promise(function(resolve) {
    chrome.extension.onConnect.addListener(resolve)
  })
}

async function listenPopupEvents(listener) {
  const port = await getPopupConnection()
  port.onMessage.addListener(listener)
}

export default {
  openOptions,
  getActiveTab,
  getPopupConnection,
  listenPopupEvents,
  sendContenScriptMessage,
  injectContentScript,
  getChecklyCookie,
  getBus,
}
