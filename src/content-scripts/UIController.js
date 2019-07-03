import EventEmitter from 'events'

const BORDER_THICKNESS = 3

class UIController extends EventEmitter {
  constructor () {
    super()
    this._overlay = null
    this._outline = null
    this._element = null
    this._dimensions = {}

    this._boundeMouseMove = this._mousemove.bind(this)
    this._boundeMouseUp = this._mouseup.bind(this)
  }

  showSelector () {
    console.debug('UIController:show')
    if (!this._overlay) {
      this._overlay = document.createElement('div')
      this._overlay.className = 'pptrRecorderOverlay'
      this._overlay.style.position = 'fixed'
      this._overlay.style.top = '0px'
      this._overlay.style.left = '0px'
      this._overlay.style.width = '100%'
      this._overlay.style.height = '100%'
      this._overlay.style.pointerEvents = 'none'
      this._outline = document.createElement('div')
      this._outline.className = 'pptrRecorderOutline'
      this._outline.style.position = 'fixed'
      this._outline.style.border = BORDER_THICKNESS + 'px solid rgba(69,200,241,0.8)'
      this._outline.style.borderRadius = '3px'
      this._overlay.appendChild(this._outline)
    }
    if (!this._overlay.parentNode) {
      document.body.appendChild(this._overlay)
      document.body.addEventListener('mousemove', this._boundeMouseMove, false)
      document.body.addEventListener('click', this._boundeMouseUp, false)
    }
  }

  hideSelector () {
    console.debug('UIController:hide')
    document.body.removeChild(this._overlay)
    this._overlay = this._outline = this._element = null
    this._dimensions = {}
  }

  _mousemove (e) {
    if (this._element !== e.target) {
      this._element = e.target

      this._dimensions.top = -window.scrollY
      this._dimensions.left = -window.scrollX

      let elem = e.target

      while (elem !== document.body) {
        this._dimensions.top += elem.offsetTop
        this._dimensions.left += elem.offsetLeft
        elem = elem.offsetParent
      }
      this._dimensions.width = this._element.offsetWidth
      this._dimensions.height = this._element.offsetHeight

      this._outline.style.top = (this._dimensions.top - BORDER_THICKNESS) + 'px'
      this._outline.style.left = (this._dimensions.left - BORDER_THICKNESS) + 'px'
      this._outline.style.width = this._dimensions.width + 'px'
      this._outline.style.height = this._dimensions.height + 'px'

      console.debug(`top: ${this._outline.style.top}, left: ${this._outline.style.left}, width: ${this._outline.style.width}, height: ${this._outline.style.height}`)
    }
  }
  _mouseup (e) {
    this._overlay.style.backgroundColor = 'white'
    setTimeout(() => {
      this._overlay.style.backgroundColor = 'none'
      this._cleanup()
      this.emit('click', {
        clip: {
          x: this._outline.style.left,
          y: this._outline.style.top,
          width: this._outline.style.width,
          height: this._outline.style.height
        },
        raw: e
      }
      )
    }, 100)
  }

  _cleanup () {
    document.body.removeEventListener('mousemove', this._boundeMouseMove, false)
    document.body.removeEventListener('mouseup', this._boundeMouseUp, false)
    document.body.removeChild(this._overlay)
  }
}

module.exports = UIController
