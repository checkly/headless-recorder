const CONTENT_SCRIPT_PATH = 'js/content-script.js'

export default {
  getActiveTab() {
    return new Promise(function(resolve) {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => resolve(tab))
    })
  },

  async sendTabMessage({ action, value, clean } = {}) {
    const tab = await this.getActiveTab()
    chrome.tabs.sendMessage(tab.id, { action, value, clean })
  },

  injectContentScript() {
    return new Promise(function(resolve) {
      chrome.tabs.executeScript({ file: CONTENT_SCRIPT_PATH, allFrames: false }, res =>
        resolve(res)
      )
    })
  },
}
