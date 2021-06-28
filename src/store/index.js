import { createStore } from 'vuex'

import { controlMessages, overlayActions } from '@/services/constants'

function clearState(state) {
  state.isClosed = false
  state.isPaused = false
  state.isStopped = false
  state.screenshotMode = false
  state.screenshotClippedMode = false
}

const store = createStore({
  state() {
    return {
      isCopying: false,
      isClosed: false,
      isPaused: false,
      isStopped: false,
      darkMode: false,
      screenshotMode: false,
      screenshotClippedMode: false,
      hasRecorded: false,

      dataAttribute: '',
      takeScreenshot: false,
    }
  },

  mutations: {
    showRecorded(state) {
      state.hasRecorded = true
      setTimeout(() => (state.hasRecorded = false), 250)
    },

    showCopy(state) {
      state.isCopying = true
      setTimeout(() => (state.isCopying = false), 250)
    },

    takeScreenshot(state) {
      state.takeScreenshot = true
    },

    setDataAttribute(state, value) {
      state.dataAttribute = value
    },

    setDarkMode(state, value) {
      state.darkMode = value
    },

    unpause(state) {
      state.isPaused = false
      chrome.runtime.sendMessage({ control: controlMessages.OVERLAY_UNPAUSE })
    },

    pause(state) {
      state.isPaused = true
      chrome.runtime.sendMessage({ control: controlMessages.OVERLAY_PAUSE })
    },

    close(state) {
      state.isClosed = true
      chrome.runtime.sendMessage({ control: overlayActions.CLOSE })
    },

    restart(state) {
      clearState(state)
      chrome.runtime.sendMessage({ control: overlayActions.RESTART })
    },

    clear(state) {
      clearState(state)
    },

    stop(state) {
      state.isStopped = true
      chrome.runtime.sendMessage({ control: controlMessages.OVERLAY_STOP })
    },

    copy() {
      chrome.runtime.sendMessage({ control: overlayActions.COPY })
    },

    toggleScreenshotMode(state) {
      state.screenshotMode = !state.screenshotMode
    },

    startScreenshotMode(state, isClipped = false) {
      chrome.runtime.sendMessage({
        control: isClipped
          ? controlMessages.OVERLAY_CLIPPED_SCREENSHOT
          : controlMessages.OVERLAY_FULL_SCREENSHOT,
      })

      state.screenshotClippedMode = isClipped
      state.screenshotMode = true
    },

    stopScreenshotMode(state) {
      state.screenshotMode = false
    },
  },
})

// TODO: load state from local storage
chrome.storage.onChanged.addListener(({ options = null }) => {
  if (options) {
    store.commit('setDarkMode', options.newValue.extension.darkMode)
  }
})

export default store
