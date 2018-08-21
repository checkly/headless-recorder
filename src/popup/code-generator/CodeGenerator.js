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

const defaults = {
  wrapAsync: true,
  headless: true,
  waitForNavigation: true
}

export default class CodeGenerator {
  constructor (options) {
    this._options = Object.assign(defaults, options)
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
    let lines = []
    let result = ''

    for (let event of events) {
      const {action, selector, value, href, keyCode} = event
      switch (action) {
        case 'keydown':
          lines.push({type: 'keydown', value: this._handleKeyDown(selector, value, keyCode)})
          break
        case 'click':
          lines.push({type: 'click', value: this._handleClick(selector, href)})
          break
        case 'goto*':
          lines.push({type: 'goto*', value: `  await page.goto('${href}')`})
          break
        case 'viewport*':
          lines.push({
            type: 'goto*', value: `  await page.setViewport({ width: ${value.width}, height: ${value.height} })`})
          break
        case 'navigation*':
          lines = this._options.waitForNavigation ? this._handleWaitForNavigation(lines) : lines
          break
        case 'reload':
          result += `  await page.reload()`
          break
      }
    }

    for (let line of lines) {
      result += line.value + '\n'
    }

    return result
  }

  _handleKeyDown (selector, value, keyCode) {
    if (keyCode === 9) return `  await page.type('${selector}', '${value}')`
    return ''
  }

  _handleClick (selector, href) {
    return `  await page.click('${selector}')`
  }

  _handleWaitForNavigation (lines) {
    if (lines.filter(l => { return l.type === 'navigation*-promise' }).length === 0) {
      lines.unshift({type: 'navigation*-promise', value: `  const navigationPromise = page.waitForNavigation()`})
    }
    lines.push({type: 'navigation*', value: `  await navigationPromise`})
    return lines
  }
}
