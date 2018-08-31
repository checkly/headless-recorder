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

const wrappedFooter = `await browser.close()
})()`

const indent = `  `
const newLine = `\n`

export const defaults = {
  wrapAsync: true,
  headless: true,
  waitForNavigation: true,
  waitForSelectorOnClick: true,
  blankLinesBetweenBlocks: true
}

export default class CodeGenerator {
  constructor (options) {
    this._options = Object.assign(defaults, options)
    this._blocks = []
    this._frame = 'page'
    this._frameId = 0
    this._allFrames = {}
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

    for (let event of events) {
      const { action, selector, value, href, keyCode, frameId, frameUrl } = event

      // we need to keep a handle on what frames events originate from
      this._setFrames(frameId, frameUrl)

      switch (action) {
        case 'keydown':
          this._blocks.push(this._handleKeyDown(selector, value, keyCode))
          break
        case 'click':
          this._blocks.push(this._handleClick(selector))
          break
        case 'goto*':
          this._blocks.push(this._handleGoto(href))
          break
        case 'viewport*':
          this._blocks.push((this._handleViewport(value.width, value.height)))
          break
        case 'navigation*':
          this._blocks.push(this._handleWaitForNavigation())
          break
      }
    }

    this._postProcess()

    for (let linesObject of this._blocks) {
      const lines = linesObject.getLines()
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
    // we want to create only one navigationPromise
    if (this._options.waitForNavigation) {
      this._postProcessWaitForNavigation()
    }

    // when events are recorded from different frames, we want to add a frame setter near the code that uses that frame
    if (Object.keys(this._allFrames).length > 0) {
      this._postProcessSetFrames()
    }

    if (this._options.blankLinesBetweenBlocks && this._blocks.length > 0) {
      this._postProcessAddBlankLines()
    }
  }

  _handleKeyDown (selector, value, keyCode) {
    const block = new Block(this._frameId)
    if (keyCode === 9) {
      block.addLine({ type: domEvents.KEYDOWN, value: `await ${this._frame}.type('${selector}', '${value}')` })
    } else {
      block.addLine({ type: domEvents.KEYDOWN, value: '' })
    }
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

  _postProcessWaitForNavigation () {
    for (let [i, block] of this._blocks.entries()) {
      const lines = block.getLines()
      for (let line of lines) {
        if (line.type === pptrActions.NAVIGATION) {
          this._blocks[i].addLineToTop({type: pptrActions.NAVIGATION_PROMISE, value: `const navigationPromise = page.waitForNavigation()`})
          return
        }
      }
    }
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
