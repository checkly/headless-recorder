import Block from '@/services/code-generator/block'
import { headlessActions } from '@/services/code-generator/constants'
import CodeGenerator from '@/services/code-generator/code-generator'

const importPuppeteer = `const puppeteer = require('puppeteer');\n`

const header = `const browser = await puppeteer.launch()
const page = await browser.newPage()`

const footer = `await browser.close()`

const wrappedHeader = `(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()\n`

const wrappedFooter = `  await browser.close()
})()`

export default class PuppeteerCodeGenerator extends CodeGenerator {
  constructor(options) {
    super(options)
    this._header = header
    this._wrappedHeader = wrappedHeader
    this._footer = footer
    this._wrappedFooter = wrappedFooter
  }

  generate(events) {
    return importPuppeteer + this._getHeader() + this._parseEvents(events) + this._getFooter()
  }

  _handleViewport(width, height) {
    return new Block(this._frameId, {
      type: headlessActions.VIEWPORT,
      value: `await ${this._frame}.setViewport({ width: ${width}, height: ${height} })`,
    })
  }
}
