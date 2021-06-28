import EventEmitter from 'events'
import { overlaySelectors } from '@/modules/overlay/constants'

const BORDER_THICKNESS = 2
class Shooter extends EventEmitter {
  constructor({ isClipped = false } = {}) {
    super()
    this._overlay = null
    this._selector = null
    this._element = null
    this._dimensions = {}
    this._isClipped = isClipped

    this._boundeMouseMove = this.mousemove.bind(this)
    this._boundeMouseUp = this.mouseup.bind(this)
  }

  startScreenshotMode() {
    if (!this._overlay) {
      this._overlay = document.createElement('div')
      this._overlay.className = 'headlessRecorderOverlay'
      this._overlay.style.position = 'fixed'
      this._overlay.style.top = '0px'
      this._overlay.style.left = '0px'
      this._overlay.style.width = '100%'
      this._overlay.style.height = '100%'
      this._overlay.style.pointerEvents = 'none'

      if (this._isClipped) {
        this._selector = document.createElement('div')
        this._selector.className = 'headlessRecorderOutline'
        this._selector.style.position = 'fixed'
        this._overlay.appendChild(this._selector)
      } else {
        this._overlay.style.border = `${BORDER_THICKNESS}px dashed rgba(255, 73, 73, 0.7)`
        this._overlay.style.background = 'rgba(255, 73, 73, 0.1)'
      }
    }
    if (!this._overlay.parentNode) {
      document.body.appendChild(this._overlay)
      document.body.addEventListener('mousemove', this._boundeMouseMove, false)
      document.body.addEventListener('click', this._boundeMouseUp, false)
    }
  }

  stopScreenshotMode() {
    if (this._overlay) {
      document.body.removeChild(this._overlay)
    }
    this._overlay = this._selector = this._element = null
    this._dimensions = {}
  }

  showScreenshotEffect() {
    document.body.classList.add(overlaySelectors.FLASH_CLASS)
    document.body.classList.remove(overlaySelectors.CURSOR_CAMERA_CLASS)
    setTimeout(() => document.body.classList.remove(overlaySelectors.FLASH_CLASS), 1000)
  }

  addCameraIcon() {
    document.body.classList.add(overlaySelectors.CURSOR_CAMERA_CLASS)
  }

  removeCameraIcon() {
    document.body.classList.remove(overlaySelectors.CURSOR_CAMERA_CLASS)
  }

  mousemove(e) {
    if (this._element !== e.target) {
      this._element = e.target

      this._dimensions.top = -window.scrollY
      this._dimensions.left = -window.scrollX

      let elem = e.target

      while (elem && elem !== document.body) {
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

      let clip = null

      if (this._selector) {
        clip = {
          x: this._selector.style.left,
          y: this._selector.style.top,
          width: this._selector.style.width,
          height: this._selector.style.height,
        }
      }

      this.emit('click', { clip, raw: e })
    }, 100)
  }

  cleanup() {
    document.body.removeEventListener('mousemove', this._boundeMouseMove, false)
    document.body.removeEventListener('mouseup', this._boundeMouseUp, false)

    document.body.removeChild(this._overlay)
    this._overlay = null
  }
}

export default Shooter
