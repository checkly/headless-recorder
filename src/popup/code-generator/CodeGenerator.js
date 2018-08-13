const importPuppeteer = `const puppeteer = require('puppeteer');\n`

const header = `const browser = await puppeteer.launch()
const page = await browser.newPage()`

const footer = `
await browser.close()`

const wrappedHeader = `$(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()\n`

const wrappedFooter = `
  await browser.close()
})()`

const defaults = {
  asyncWrapper: true
}

export default class CodeGenerator {
  constructor (options) {
    this._options = Object.assign(defaults, options)
    this._header = this._options.asyncWrapper ? wrappedHeader : header
    this._footer = this._options.asyncWrapper ? wrappedFooter : footer
  }

  generate (events) {
    return importPuppeteer + this._header + this._parseEvents(events) + this._footer
  }

  _parseEvents (events) {
    console.debug(`generating code for ${events.length} events`)
    let result = ''
    for (let event of events) {
      const { action, url, selector, value, href, keyCode } = event
      switch (action) {
        case 'keydown':
          result += this._handleKeyDown(selector, value, keyCode)
          break
        case 'click':
          result += this._handleClick(selector, href)
          break
        case 'goto':
          result += `  await page.goto('${url}')\n`
          break
        case 'reload':
          result += `  await page.reload()\n`
          break
      }
    }
    return result
  }
  _handleKeyDown (selector, value, keyCode) {
    if (keyCode === 9) return `  await page.type('${selector}', '${value}')\n`
    return ''
  }

  _handleClick (selector, href) {
    if (href) return `  await page.goto('${href}')\n`
    return `  await page.click('${selector}')\n`
  }
}
