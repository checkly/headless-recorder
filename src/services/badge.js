export function setPause() {
  chrome.browserAction.setIcon({ path: './images/logo-yellow.png' })
}

export function setWait() {
  chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000' })
  chrome.browserAction.setBadgeText({ text: 'wait' })
}

export function setRecording() {
  chrome.browserAction.setIcon({ path: './images/logo-red.png' })
}

export function setResult(text = '') {
  chrome.browserAction.setIcon({ path: './images/logo.png' })
  chrome.browserAction.setBadgeText({ text })
  chrome.browserAction.setBadgeBackgroundColor({ color: '#45C8F1' })
}

export const reset = () => ''

export default {
  setWait,
  setPause,
  setResult,
  setRecording,
  reset,
}
