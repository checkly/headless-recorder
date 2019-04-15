import domEvents from './dom-events-to-record'
import pptrActions from './pptr-actions'
import Block from './Block'

const importPuppeteer = `const puppeteer = require('puppeteer');\n`

const header = `const browser = await puppeteer.launch()
const page = await browser.newPage()`

const footer = `await browser.close()`

const wrappedHeader = `(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()\n`

const wrappedFooter = `  await browser.close()
})()`

export const defaults = {
  wrapAsync: true,
  headless: true,
  waitForNavigation: true,
  waitForSelectorOnClick: true,
  blankLinesBetweenBlocks: true,
  dataAttribute: ''
}

export default class CodeGenerator {
  constructor (options) {
    this._options = Object.assign(defaults, options)
    this._blocks = []
    this._frame = 'page'
    this._frameId = 0
    this._allFrames = {}

    this._hasNavigation = false
  }

  generate (events) {
    return importPuppeteer + this._getHeader() + this._parseEvents(events) + this._getFooter()
  }

  _getHeader () {
    console.debug(this._options)
    let hdr = this._options.wrapAsync ? wrappedHeader : header
    hdr = this._options.headless ? hdr : hdr.replace('launch()', 'launch({ headless: false })')
    return hdr
  }

  _getFooter () {
    return this._options.wrapAsync ? wrappedFooter : footer
  }

  _parseEvents (events) {
    console.debug(`generating code for ${events ? events.length : 0} events`)
    let result = ''

    for (let i = 0; i < events.length; i++) {
      const { action, selector, value, href, keyCode, tagName, frameId, frameUrl } = events[i]

      // we need to keep a handle on what frames events originate from
      this._setFrames(frameId, frameUrl)

      switch (action) {
        case 'keydown':
          if (keyCode === 9) { // tab key
            this._blocks.push(this._handleKeyDown(selector, value, keyCode))
          }
          break
        case 'click':
          this._blocks.push(this._handleClick(selector, events))
          break
        case 'change':
          if (tagName === 'SELECT') {
            this._blocks.push(this._handleChange(selector, value))
          }
          break
        case 'goto*':
          this._blocks.push(this._handleGoto(href, frameId))
          break
        case 'viewport*':
          this._blocks.push((this._handleViewport(value.width, value.height)))
          break
        case 'navigation*':
          this._blocks.push(this._handleWaitForNavigation())
          this._hasNavigation = true
          break
      }
    }

    if (this._hasNavigation && this._options.waitForNavigation) {
      console.debug('Adding navigationPromise declaration')
      const block = new Block(this._frameId, { type: pptrActions.NAVIGATION_PROMISE, value: 'const navigationPromise = page.waitForNavigation()' })
      this._blocks.unshift(block)
    }

    console.debug('post processing blocks:', this._blocks)
    this._postProcess()

    const indent = this._options.wrapAsync ? '  ' : ''
    const newLine = `\n`

    for (let block of this._blocks) {
      const lines = block.getLines()
      for (let line of lines) {
        result += indent + line.value + newLine
      }
    }

    return result
  }

  _setFrames (frameId, frameUrl) {
    if (frameId && frameId !== 0) {
      this._frameId = frameId
      this._frame = `frame_${frameId}`
      this._allFrames[frameId] = frameUrl
    } else {
      this._frameId = 0
      this._frame = 'page'
    }
  }

  _postProcess () {
    // when events are recorded from different frames, we want to add a frame setter near the code that uses that frame
    if (Object.keys(this._allFrames).length > 0) {
      this._postProcessSetFrames()
    }

    if (this._options.blankLinesBetweenBlocks && this._blocks.length > 0) {
      this._postProcessAddBlankLines()
    }
  }

  _handleKeyDown (selector, value) {
    const block = new Block(this._frameId)
    block.addLine({ type: domEvents.KEYDOWN, value: `await ${this._frame}.type('${selector}', '${value}')` })
    return block
  }

  _handleClick (selector) {
    const block = new Block(this._frameId)
    if (this._options.waitForSelectorOnClick) {
      block.addLine({ type: domEvents.CLICK, value: `await ${this._frame}.waitForSelector('${selector}')` })
    }
    block.addLine({ type: domEvents.CLICK, value: `await ${this._frame}.click('${selector}')` })
    return block
  }
  _handleChange (selector, value) {
    return new Block(this._frameId, { type: domEvents.CHANGE, value: `await ${this._frame}.select('${selector}', '${value}')` })
  }
  _handleGoto (href) {
    return new Block(this._frameId, { type: pptrActions.GOTO, value: `await ${this._frame}.goto('${href}')` })
  }

  _handleViewport (width, height) {
    return new Block(this._frameId, { type: pptrActions.VIEWPORT, value: `await ${this._frame}.setViewport({ width: ${width}, height: ${height} })` })
  }

  _handleWaitForNavigation () {
    const block = new Block(this._frameId)
    if (this._options.waitForNavigation) {
      block.addLine({type: pptrActions.NAVIGATION, value: `await navigationPromise`})
    }
    return block
  }

  _postProcessSetFrames () {
    for (let [i, block] of this._blocks.entries()) {
      const lines = block.getLines()
      for (let line of lines) {
        if (line.frameId && Object.keys(this._allFrames).includes(line.frameId.toString())) {
          const declaration = `const frame_${line.frameId} = frames.find(f => f.url() === '${this._allFrames[line.frameId]}')`
          this._blocks[i].addLineToTop(({ type: pptrActions.FRAME_SET, value: declaration }))
          this._blocks[i].addLineToTop({ type: pptrActions.FRAME_SET, value: 'let frames = await page.frames()' })
          delete this._allFrames[line.frameId]
          break
        }
      }
    }
  }

  _postProcessAddBlankLines () {
    let i = 0
    while (i <= this._blocks.length) {
      const blankLine = new Block()
      blankLine.addLine({ type: null, value: '' })
      this._blocks.splice(i, 0, blankLine)
      i += 2
    }
  }
}
