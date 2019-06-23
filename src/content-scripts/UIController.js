const BORDER_THICKNESS = 4

class UIController {
  constructor () {
    this.overlay = null
    this.outline = null
    this.element = null
    this.dimensions = {}
  }

  showScreenshotSelector () {
    console.debug('UIController:show')
    if (!this.overlay) {
      this.overlay = document.createElement('div')
      this.overlay.style.position = 'fixed'
      this.overlay.style.top = '0px'
      this.overlay.style.left = '0px'
      this.overlay.style.width = '100%'
      this.overlay.style.height = '100%'
      this.overlay.style.pointerEvents = 'none'
      this.outline = document.createElement('div')
      this.outline.style.position = 'fixed'
      this.outline.style.border = BORDER_THICKNESS + 'px solid rgba(69,200,241,0.5)'
      this.outline.style.borderRadius = '3px'
      this.overlay.appendChild(this.outline)
    }
    if (!this.overlay.parentNode) {
      document.body.appendChild(this.overlay)
      document.body.addEventListener('mousemove', this._mousemove.bind(this), false)
      document.body.addEventListener('mouseup', this._mouseup.bind(this), false)
    }
  }
  hideScreenshotSelector () {
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
    }
  }
  _mouseup () {
    console.debug('UIController: overlay:', this.overlay)
    document.body.removeEventListener('mousemove', this._mousemove, false)
    document.body.removeEventListener('mouseup', this._mouseup, false)
  }
}

module.exports = UIController
