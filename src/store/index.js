import { createStore } from 'vuex'

import { controlMessages } from '@/services/constants'

const store = createStore({
  state() {
    return {
      isPaused: false,
      isStopped: false,
      darkMode: false,
      screenshotMode: false,
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

    takeScreenshot(state) {
      state.takeScreenshot = true
    },

    setDataAttribute(state, value) {
      state.dataAttribute = value
    },

    setDarkMode(state, value) {
      state.darkMode = value
    },

    pause(state) {
      state.isPaused = !state.isPaused
      chrome.runtime.sendMessage({ control: controlMessages.OVERLAY_PAUSE })
    },

    stop(state) {
      state.isStopped = true
      chrome.runtime.sendMessage({ control: controlMessages.OVERLAY_STOP })
    },

    toggleScreenshotMode(state) {
      console.log(state)
      state.screenshotMode = !state.screenshotMode
    },

    startScreenshotMode(state, isClipped = false) {
      chrome.runtime.sendMessage({
        control: isClipped
          ? controlMessages.OVERLAY_CLIPPED_SCREENSHOT
          : controlMessages.OVERLAY_FULL_SCREENSHOT,
      })
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
