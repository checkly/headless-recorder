export default {
  get(props) {
    if (!chrome.storage || !chrome.storage.local) {
      return Promise.resolve()
    }

    return new Promise(function(resolve) {
      chrome.storage.local.get(props, props => resolve(props))
    })
  },
}
