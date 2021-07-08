import EventEmitter from 'events'
import getSelector from '@/services/selector'
import { overlayActions, overlaySelectors } from '@/modules/overlay/constants'

const BORDER_THICKNESS = 2
class Shooter extends EventEmitter {
  constructor({ isClipped = false, store } = {}) {
    super()

    this.store = store
    this.isClipped = isClipped

    this._overlay = null
    this._selector = null
    this._element = null
    this._dimensions = {}
    this.currentSelctor = ''

    this._boundeMouseMove = this.mousemove.bind(this)
    this._boundeMouseOver = this.mouseover.bind(this)
    this._boundeMouseUp = this.mouseup.bind(this)
    this._boundedKeyUp = this.keyup.bind(this)
  }

  mouseover(e) {
    this.currentSelctor = getSelector(e, { dataAttribute: this.store.state.dataAttribute }).replace(
      '.' + overlaySelectors.CURSOR_CAMERA_CLASS,
      'body'
    )
  }

  startScreenshotMode() {
    if (!this._overlay) {
      this._overlay = window.document.createElement('div')
      this._overlay.id = 'headless-recorder-shooter'
      this._overlay.style.position = 'fixed'
      this._overlay.style.top = '0px'
      this._overlay.style.left = '0px'
      this._overlay.style.width = '100%'
      this._overlay.style.height = '100%'
      this._overlay.style.pointerEvents = 'none'
      this._overlay.style.zIndex = 2147483646

      if (this.isClipped) {
        this._selector = window.document.createElement('div')
        this._selector.id = 'headless-recorder-shooter-outline'
        this._selector.style.position = 'fixed'
        this._overlay.appendChild(this._selector)
      } else {
        this._overlay.style.border = `${BORDER_THICKNESS}px dashed rgba(255, 73, 73, 0.7)`
        this._overlay.style.background = 'rgba(255, 73, 73, 0.1)'
      }
    }

    if (!this._overlay.parentNode) {
      window.document.body.appendChild(this._overlay)

      window.document.body.addEventListener('mousemove', this._boundeMouseMove, false)
      window.document.body.addEventListener('click', this._boundeMouseUp, false)
      window.document.body.addEventListener('keyup', this._boundedKeyUp, false)
      window.document.addEventListener('mouseover', this._boundeMouseOver, false)
    }
  }

  stopScreenshotMode() {
    if (this._overlay) {
      window.document.body.removeChild(this._overlay)
    }
    this._overlay = this._selector = this._element = null
    this._dimensions = {}
  }

  showScreenshotEffect() {
    window.document.body.classList.add(overlaySelectors.FLASH_CLASS)
    window.document.body.classList.remove(overlaySelectors.CURSOR_CAMERA_CLASS)
    setTimeout(() => window.document.body.classList.remove(overlaySelectors.FLASH_CLASS), 1000)
  }

  addCameraIcon() {
    window.document.body.classList.add(overlaySelectors.CURSOR_CAMERA_CLASS)
  }

  removeCameraIcon() {
    window.document.body.classList.remove(overlaySelectors.CURSOR_CAMERA_CLASS)
  }

  mousemove(e) {
    if (this._element !== e.target) {
      this._element = e.target

      this._dimensions.top = -window.scrollY
      this._dimensions.left = -window.scrollX

      let elem = e.target

      while (elem && elem !== window.document.body) {
        this._dimensions.top += elem.offsetTop
        this._dimensions.left += elem.offsetLeft
        elem = elem.offsetParent
      }
      this._dimensions.width = this._element.offsetWidth
      this._dimensions.height = this._element.offsetHeight

      if (this._selector) {
        this._selector.style.top = this._dimensions.top - BORDER_THICKNESS + 'px'
        this._selector.style.left = this._dimensions.left - BORDER_THICKNESS + 'px'
        this._selector.style.width = this._dimensions.width + 'px'
        this._selector.style.height = this._dimensions.height + 'px'
      }
    }
  }

  mouseup(e) {
    setTimeout(() => {
      this.cleanup()
      const payload = { raw: e }

      if (this.isClipped) {
        payload.selector = this.currentSelctor
      }

      this.emit('click', payload)
    }, 100)
  }

  keyup(e) {
    if (e.code !== 'Escape') {
      return
    }

    this.cleanup()
    this.removeCameraIcon()
    chrome.runtime.sendMessage({ control: overlayActions.ABORT_SCREENSHOT })
  }

  cleanup() {
    window.document.body.removeEventListener('mousemove', this._boundeMouseMove, false)
    window.document.body.removeEventListener('click', this._boundeMouseUp, false)
    window.document.body.removeEventListener('keyup', this._boundedKeyUp, false)
    window.document.removeEventListener('mouseover', this._boundeMouseOver, false)

    window.document.body.removeChild(this._overlay)
    this._overlay = null
  }
}

export default Shooter
