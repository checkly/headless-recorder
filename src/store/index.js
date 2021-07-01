import { createStore } from 'vuex'

import { overlayActions } from '@/modules/overlay/constants'

function clearState(state) {
  state.isClosed = false
  state.isPaused = false
  state.isStopped = false
  state.screenshotMode = false
  state.screenshotClippedMode = false

  state.recording = []
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

      recording: [],
    }
  },

  mutations: {
    showRecorded(state) {
      state.hasRecorded = true
      setTimeout(() => (state.hasRecorded = false), 250)
    },

    showCopy(state) {
      state.isCopying = true
      setTimeout(() => (state.isCopying = false), 500)
    },

    takeScreenshot(state) {
      state.takeScreenshot = true
    },

    setDataAttribute(state, dataAttribute) {
      state.dataAttribute = dataAttribute
    },

    setDarkMode(state, darkMode) {
      state.darkMode = darkMode
    },

    setRecording(state, recording) {
      state.recording = recording
    },

    unpause(state) {
      state.isPaused = false
      chrome.runtime.sendMessage({ control: overlayActions.UNPAUSE })
    },

    pause(state) {
      state.isPaused = true
      chrome.runtime.sendMessage({ control: overlayActions.PAUSE })
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
      chrome.runtime.sendMessage({ control: overlayActions.STOP })
    },

    copy() {
      chrome.runtime.sendMessage({ control: overlayActions.COPY })
    },

    toggleScreenshotMode(state) {
      state.screenshotMode = !state.screenshotMode
    },

    startScreenshotMode(state, isClipped = false) {
      chrome.runtime.sendMessage({
        control: isClipped ? overlayActions.CLIPPED_SCREENSHOT : overlayActions.FULL_SCREENSHOT,
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
chrome.storage.onChanged.addListener(({ options = null, recording = null }) => {
  if (options) {
    store.commit('setDarkMode', options.newValue.extension.darkMode)
  }

  if (recording) {
    store.commit('setRecording', recording.newValue)
  }
})

export default store
