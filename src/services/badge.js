const DEFAULT_COLOR = '#45C8F1'
const RECORDING_COLOR = '#FF0000'

const DEFAULT_LOGO = './images/logo.png'
const RECORDING_LOGO = './images/logo-red.png'
const PAUSE_LOGO = './images/logo-yellow.png'

export default {
  stop(text) {
    chrome.browserAction.setIcon({ path: DEFAULT_LOGO })
    chrome.browserAction.setBadgeBackgroundColor({ color: DEFAULT_COLOR })
    this.setText(text)
  },

  reset() {
    this.setText('')
  },

  setText(text) {
    chrome.browserAction.setBadgeText({ text })
  },

  pause() {
    chrome.browserAction.setIcon({ path: PAUSE_LOGO })
  },

  start() {
    chrome.browserAction.setIcon({ path: RECORDING_LOGO })
  },

  wait() {
    chrome.browserAction.setBadgeBackgroundColor({ color: RECORDING_COLOR })
    this.setText('wait')
  },
}
