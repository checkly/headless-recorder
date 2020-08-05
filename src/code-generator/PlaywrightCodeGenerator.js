import pptrActions from './pptr-actions'
import Block from './Block'
import CodeGenerator from './CodeGenerator'

const importPlaywright = `const playwright = require('playwright');\n`

const header = `const browser = await playwright.chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()`

const footer = `await browser.close()`

const wrappedHeader = `(async () => {
  ${header}\n`

const wrappedFooter = `  ${footer}
})()`

export default class PlaywrightCodeGenerator extends CodeGenerator {
  generate (events) {
    return importPlaywright + this._getHeader() + this._parseEvents(events) + this._getFooter()
  }

  _handleViewport (width, height) {
    return new Block(this._frameId, { type: pptrActions.VIEWPORT, value: `await ${this._frame}.setViewportSize({ width: ${width}, height: ${height} })` })
  }
}
