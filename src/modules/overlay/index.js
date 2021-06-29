import { createApp } from 'vue'

import getSelector from '@/services/selector'
import SelectorApp from '@/modules/overlay/Selector.vue'
import OverlayApp from '@/modules/overlay/Overlay.vue'
import { overlaySelectors } from '@/modules/overlay/constants'

export default class Overlay {
  constructor({ store }) {
    this.overlayApp = null
    this.selectorApp = null

    this.overlayContainer = null
    this.selectorContainer = null

    this.mouseOverEvent = null

    this.store = store
  }

  mount({ clear = false, pause = false } = {}) {
    if (this.overlayContainer) {
      return
    }

    this.overlayContainer = document.createElement('div')
    this.overlayContainer.id = overlaySelectors.OVERLAY_ID
    document.body.appendChild(this.overlayContainer)

    this.selectorContainer = document.createElement('div')
    this.selectorContainer.id = overlaySelectors.SELECTOR_ID
    document.body.appendChild(this.selectorContainer)

    if (clear) {
      this.store.commit('clear')
    }
    if (pause) {
      this.store.commit('pause')
    }

    this.selectorApp = createApp(SelectorApp)
      .use(this.store)
      .mount('#' + overlaySelectors.SELECTOR_ID)

    this.overlayApp = createApp(OverlayApp)
      .use(this.store)
      .mount('#' + overlaySelectors.OVERLAY_ID)

    this.mouseOverEvent = e => {
      const selector = getSelector(e)
      this.overlayApp.currentSelector = selector.includes('#' + overlaySelectors.OVERLAY_ID)
        ? ''
        : selector

      if (
        this.overlayApp.currentSelector &&
        (!this.store.state.screenshotMode || this.store.state.screenshotClippedMode)
      ) {
        this.selectorApp.move(e, [overlaySelectors.OVERLAY_ID])
      }
    }

    window.document.addEventListener('mouseover', this.mouseOverEvent)
  }

  unmount() {
    if (!this.overlayContainer) {
      return
    }

    document.body.removeChild(this.overlayContainer)
    document.body.removeChild(this.selectorContainer)

    this.overlayContainer = null
    this.overlayApp = null
    this.selectorContainer = null
    this.selectorApp = null

    window.document.removeEventListener('mouseover', this.mouseOverEvent)
  }
}
