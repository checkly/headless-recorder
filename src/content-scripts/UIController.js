import EventEmitter from 'events'

const BORDER_THICKNESS = 3

class UIController extends EventEmitter {
  constructor () {
    super()
    this.overlay = null
    this.outline = null
    this.element = null
    this.dimensions = {}

    this.boundeMouseMove = this._mousemove.bind(this)
    this.boundeMouseUp = this._mouseup.bind(this)
  }

  showSelector () {
    console.debug('UIController:show')
    if (!this.overlay) {
      this.overlay = document.createElement('div')
      this.overlay.className = 'pptrRecorderOverlay'
      this.overlay.style.position = 'fixed'
      this.overlay.style.top = '0px'
      this.overlay.style.left = '0px'
      this.overlay.style.width = '100%'
      this.overlay.style.height = '100%'
      this.overlay.style.pointerEvents = 'none'
      this.outline = document.createElement('div')
      this.outline.className = 'pptrRecorderOutline'
      this.outline.style.position = 'fixed'
      this.outline.style.border = BORDER_THICKNESS + 'px solid rgba(69,200,241,0.8)'
      this.outline.style.borderRadius = '3px'
      this.overlay.appendChild(this.outline)
    }
    if (!this.overlay.parentNode) {
      document.body.appendChild(this.overlay)
      document.body.addEventListener('mousemove', this.boundeMouseMove, false)
      document.body.addEventListener('mouseup', this.boundeMouseUp, false)
    }
  }

  hideSelector () {
    console.debug('UIController:hide')
    this.overlay = this.outline = this.element = null
    this.dimensions = {}
  }

  _mousemove (e) {
    if (this.element !== e.target) {
      this.element = e.target

      this.dimensions.top = -window.scrollY
      this.dimensions.left = -window.scrollX

      let elem = e.target

      while (elem !== document.body) {
        this.dimensions.top += elem.offsetTop
        this.dimensions.left += elem.offsetLeft
        elem = elem.offsetParent
      }
      this.dimensions.width = this.element.offsetWidth
      this.dimensions.height = this.element.offsetHeight

      this.outline.style.top = (this.dimensions.top - BORDER_THICKNESS) + 'px'
      this.outline.style.left = (this.dimensions.left - BORDER_THICKNESS) + 'px'
      this.outline.style.width = this.dimensions.width + 'px'
      this.outline.style.height = this.dimensions.height + 'px'
      // console.debug(`x: ${this.outline.style.top}, y:${this.outline.style.left}, w: ${this.outline.style.width }, h:${this.outline.style.height}`)
    }
  }
  _mouseup (e) {
    // console.debug('UIController: overlay:', this.overlay)
    // console.debug('UIController: event:', e)
    this._cleanup()
    this.emit('click', e)
  }

  _cleanup () {
    document.body.removeEventListener('mousemove', this.boundeMouseMove, false)
    document.body.removeEventListener('mouseup', this.boundeMouseUp, false)
    document.body.removeChild(this.overlay)
  }
}

module.exports = UIController
