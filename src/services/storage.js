export default {
  get(keys) {
    if (!chrome.storage || !chrome.storage.local) {
      return Promise.reject('Browser storage not available')
    }

    return new Promise(function(resolve) {
      chrome.storage.local.get(keys, props => resolve(props))
    })
  },

  set(props) {
    if (!chrome.storage || !chrome.storage.local) {
      return Promise.reject('Browser storage not available')
    }

    return new Promise(function(resolve) {
      chrome.storage.local.set(props, res => resolve(res))
    })
  },
}
