// todo: split into blocks and lines.
import domEvents from './dom-events-to-record'
import pptrActions from './pptr-actions'

const importPuppeteer = `const puppeteer = require('puppeteer');\n`

const header = `const browser = await puppeteer.launch()
const page = await browser.newPage()`

const footer = `
await browser.close()`

const wrappedHeader = `(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()\n`

const wrappedFooter = `
  await browser.close()
})()`

const indent = `  `
const newLine = `\n`

const defaults = {
  wrapAsync: true,
  headless: true,
  waitForNavigation: true,
  waitForSelectorOnClick: true
}

export default class CodeGenerator {
  constructor (options) {
    this._options = Object.assign(defaults, options)
    this._blocks = []
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
    console.debug(`generating code for ${events.length} events`)
    let result = ''

    for (let event of events) {
      const { action, selector, value, href, keyCode } = event
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

    for (let lines of this._blocks) {
      for (let line of lines) {
        result += indent + line.value + newLine
      }
    }

    return result
  }

  _postProcess () {

    // we want to create only one navigationPromise
    if (this._options.waitForNavigation) {
      for (let i = 0; i < this._blocks.length; i++) {
        for (let j = 0; j < this._blocks[i].length; j++) {
          if (this._blocks[i][j].type === pptrActions.NAVIGATION) {
            this._blocks[i].unshift({type: pptrActions.NAVIGATION_PROMISE, value: `const navigationPromise = page.waitForNavigation()`})
            break
          }
        }
      }
    }
  }

  _handleKeyDown (selector, value, keyCode) {
    const lines = []
    if (keyCode === 9) {
      lines.push({ type: domEvents.KEYDOWN, value: `await page.type('${selector}', '${value}')` })
    } else {
      lines.push({ type: domEvents.KEYDOWN, value: '' })
    }
    return lines
  }

  _handleClick (selector) {
    const lines = []
    if (this._options.waitForSelectorOnClick) {
      lines.push({ type: domEvents.CLICK, value: `await page.waitForSelector('${selector}')` })
    }
    lines.push({ type: domEvents.CLICK, value: `await page.click('${selector}')` })
    return lines
  }

  _handleGoto (href) {
    return [{ type: pptrActions.GOTO, value: `await page.goto('${href}')` }]
  }

  _handleViewport (width, height) {
    return [{ type: pptrActions.VIEWPORT, value: `await page.setViewport({ width: ${width}, height: ${height} })` }]
  }

  _handleWaitForNavigation () {
    const lines = []
    if (this._options.waitForNavigation) {
      lines.push({type: pptrActions.NAVIGATION, value: `await navigationPromise`})
    }
    return lines
  }

  _addFrameSelector (frameUrl) {
    return `const frames = await page.frames()` + newLine + indent + `const frame = frames.find(f => f.url() === '${frameUrl}')` + newLine
  }
}
