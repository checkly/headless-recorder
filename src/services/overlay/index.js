import { createApp } from 'vue'

import getSelector from '@/services/selector'
import { overlaySelectors } from '@/services/constants'

import Selector from './Selector.vue'
import OverlayApp from './Overlay.vue'

export default class Overlay {
  constructor({ store }) {
    this.overlayApp = null
    this.selectorApp = null

    this.overlayContainer = null
    this.selectorContainer = null

    this.mouseOverEvent = null

    this.store = store
  }

  init() {
    // TODO: look for dark mode (and default settings)
  }

  mount() {
    if (this.overlayContainer) {
      return
    }

    this.overlayContainer = document.createElement('div')
    this.overlayContainer.id = overlaySelectors.OVERLAY_ID
    document.body.appendChild(this.overlayContainer)

    this.selectorContainer = document.createElement('div')
    this.selectorContainer.id = overlaySelectors.OVERLAY_ID + 1
    document.body.appendChild(this.selectorContainer)

    this.selectorApp = createApp(Selector)
      .use(this.store)
      .mount('#' + overlaySelectors.OVERLAY_ID + 1)

    this.overlayApp = createApp(OverlayApp)
      .use(this.store)
      .mount('#' + overlaySelectors.OVERLAY_ID)

    this.overlayApp.darkMode = this._darkMode

    this.mouseOverEvent = e => {
      const selector = getSelector(e)
      this.overlayApp.currentSelector = selector.includes('#' + overlaySelectors.OVERLAY_ID)
        ? ''
        : selector

      if (
        this.overlayApp.currentSelector &&
        (!this._screenShotMode || this._uiController._isClipped)
      ) {
        this.selectorApp.move(e, [overlaySelectors.OVERLAY_ID])
      }
    }

    window.document.addEventListener('mouseover', this.mouseOverEvent)
  }

  unmount() {
    document.body.removeChild(this.overlayContainer)
    document.body.removeChild(this.selectorContainer)

    this.overlayContainer = null
    this.overlayApp = null
    this.selectorContainer = null
    this.selectorApp = null

    window.document.removeEventListener('mouseover', this.mouseOverEvent)
  }
}
