import pptrActions from './pptr-actions'
import Block from './Block'
import CodeGenerator from './CodeGenerator'

const importPlaywright = `const { chromium } = require('playwright');\n`

const header = `const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()`

const footer = `await browser.close()`

const wrappedHeader = `(async () => {
  ${header}\n`

const wrappedFooter = `  ${footer}
})()`

export default class PlaywrightCodeGenerator extends CodeGenerator {
  constructor (options) {
    super(options)
    this._header = header
    this._wrappedHeader = wrappedHeader
    this._footer = footer
    this._wrappedFooter = wrappedFooter
  }

  generate (events) {
    return importPlaywright + this._getHeader() + this._parseEvents(events) + this._getFooter()
  }

  _handleViewport (width, height) {
    return new Block(this._frameId, { type: pptrActions.VIEWPORT, value: `await ${this._frame}.setViewportSize({ width: ${width}, height: ${height} })` })
  }

  _handleChange (selector, value) {
    return new Block(this._frameId, { type: pptrActions.CHANGE, value: `await ${this._frame}.selectOption('${selector}', '${value}')` })
  }
}
