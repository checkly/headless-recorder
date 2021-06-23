import { uiActions, isDarkMode, controlMessages } from '@/services/constants'

import store from '@/store'
import storage from '@/services/storage'
import Shooter from '@/services/shooter'

export default class HeadlessController {
  constructor({ overlay, recorder }) {
    this.backgroundListener = null

    this.shooter = null
    this.overlay = overlay
    this.recorder = recorder
  }

  async init() {
    const { options } = await storage.get(['options'])

    const darkMode = options && options.extension ? options.extension.darkMode : isDarkMode()
    const { dataAttribute } = options ? options.code : {}

    store.commit('setDarkMode', darkMode)
    store.commit('setDataAttribute', dataAttribute)

    this.recorder.init(() => this.listenBackgroundMessages())

    this.overlay.init()
  }

  listenBackgroundMessages() {
    this.backgroundListener = this.backgroundListener || this.handleBackgroundMessages.bind(this)
    chrome.runtime.onMessage.addListener(this.backgroundListener)
  }

  handleBackgroundMessages(msg) {
    if (msg && msg.action) {
      switch (msg.action) {
        case uiActions.TOGGLE_SCREENSHOT_MODE:
          this.handleScreenshot(false)
          break

        case uiActions.TOGGLE_SCREENSHOT_CLIPPED_MODE:
          this.handleScreenshot(true)
          break

        case uiActions.CLOSE_SCREENSHOT_MODE:
          this.cancelScreenshot()
          break

        case uiActions.TOGGLE_OVERLAY:
          msg.value ? this.overlay.mount() : this.overlay.unmount()
          break

        case uiActions.PAUSE:
          store.commit('pause')
          break

        case uiActions.UN_PAUSE:
          store.commit('pause')
          break
      }
    }
  }

  handleScreenshot(isClipped) {
    this.recorder.disableClickRecording()
    this.shooter = new Shooter({ isClipped })

    this.shooter.addCameraIcon()

    store.state.screenshotMode
      ? this.shooter.startScreenshotMode()
      : this.shooter.stopScreenshotMode()

    this.shooter.on('click', ({ clip }) => {
      store.commit('stopScreenshotMode')

      this.shooter.showScreenshotEffect()
      this.recorder._sendMessage({ control: controlMessages.GET_SCREENSHOT, value: clip })
      this.recorder.enableClickRecording()
    })
  }

  cancelScreenshot() {
    if (!store.state.screenshotMode) {
      return
    }

    store.commit('stopScreenshotMode')
    this.shooter.removeCameraIcon()
    this.shooter.stopScreenshotMode()
    this.recorder.enableClickRecording()
  }
}
