import domEvents from './dom-events-to-record'
import pptrActions from './pptr-actions'
import Block from './Block'

const importPuppeteer = `const puppeteer = require('puppeteer');\n`

const header = `const browser = await puppeteer.launch()
const page = await browser.newPage()\n`

const footer = `await browser.close()`

const asyncOpener = `(async () => {\n`

const wrappedHeader = asyncOpener + `
  const browser = await puppeteer.launch()
  const page = await browser.newPage()\n`

const wrappedFooter = `  await browser.close()
})()`

export const defaults = {
  wrapAsync: true,
  headless: true,
  waitForNavigation: true,
  waitForSelectorOnClick: true,
  waitTillVisible: false,
  blankLinesBetweenBlocks: true,
  wait: 2000,
  typingTerminator: 9,
  cookies: "[]",
  localStorage: "{}"
}

export default class CodeGenerator {
  constructor (options) {
    this._options = Object.assign(defaults, options)
    this._blocks = []
    this._frame = 'page'
    this._frameId = 0
    this._allFrames = {}
    this._navigationPromiseSet = false
  }

  generate (events) {
    return importPuppeteer + this._getHeader() + this._parseEvents(events) + this._getFooter()
  }

  addCookies(){
    let script = ""
    let spacing = this._options.wrapAsync ? "  " : "";
    var cookies = JSON.parse(this._options.cookies)
    for (var key in cookies) {
      var keyValue = JSON.stringify(cookies[key])
      script = script + spacing + `await page.setCookie(${keyValue})\n`
    }
    return script;
  }

  _getHeader () {
    console.debug(this._options)
    let hdr = this._options.wrapAsync ? wrappedHeader : header
    hdr = this._options.headless ? hdr : hdr.replace('launch()', 'launch({ headless: false })')
    hdr = hdr + this.addCookies();
    return hdr
  }

  _getFooter () {
    return this._options.wrapAsync ? wrappedFooter : footer
  }

  _parseEvents (events) {
    console.debug(`generating code for ${events ? events.length : 0} events`)
    let result = ''

    for (let i = 0; i < events.length; i++) {
      const { action, selector, value, href, keyCode, tagName, frameId, frameUrl, altKey, ctrlKey, innerText } = events[i]
      // we need to keep a handle on what frames events originate from
      this._setFrames(frameId, frameUrl)

      switch (action) {
        case 'keydown':
          if (keyCode == this._options.typingTerminator) {
            this._blocks.push(this._handleKeyDown(selector, value, keyCode))
          }
          if (keyCode == 13) {
            this._blocks.push(this._handleEnter(selector))
          }
          break
        case 'click':
          const next = i + 1
          const previous = i - 1
          if (events[next] && events[next].action === 'navigation*' && this._options.waitForNavigation && !this._navigationPromiseSet) {
            const block = new Block(this._frameId)
            block.addLine({type: pptrActions.NAVIGATION_PROMISE, value: `const navigationPromise = page.waitForNavigation()`})
            this._blocks.push(block)
            this._navigationPromiseSet = true
          }
          if(events[previous] && events[previous].action == 'text-click*'){
            this._blocks.push(this._handleClickText(tagName, innerText))
          } else if(events[previous] && events[previous].action == 'wait-for*'){
            this._blocks.push(this._handleWaitFor(tagName, innerText))
          } else {
            this._blocks.push(this._handleClick(selector))
          }
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
          break
        case 'wait*':
          this._blocks.push(this._handleAddWait(this._options.wait))
          break
        case 'set-local-storage*':
          this._blocks.push(this._handleSetLocalStorage())
          break
      }
    }

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
    // we want to create only one navigationPromise
    if (this._options.waitForNavigation && !this._navigationPromiseSet) {
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

  _handleSetLocalStorage() {
    const block = new Block(this._frameId)
    let script = ""
    let spacing = this._options.wrapAsync ? "  " : "";
    var storage = JSON.parse(this._options.localStorage)
    if(Object.keys(storage).length > 0){
      block.addLine({ value: `await page.evaluate(() => {`})
      for (var key in storage) {
        var keyValue = storage[key]
        block.addLine({ value: `  localStorage.setItem("${key}", "${keyValue}")`})
      }
      block.addLine({ value: `})`})
    }
    return block
  }

  _handleAddWait(period) {
    const block = new Block(this._frameId)
    block.addLine({ value: `await page.waitFor(${period});`})
    return block
  }

  _handleClickText(tagName, innerText) {
    const block = new Block(this._frameId)
    block.addLine({ value: `var item = await ${this._frame}.waitForXPath('//${tagName}[normalize-space() = "${innerText}"]', {visible: ${this._options.waitTillVisible}})`})
    block.addLine({ value: `await item.asElement().click()`})
    return block
  }

  _handleWaitFor(tagName, innerText) {
    const block = new Block(this._frameId)
    block.addLine({ value: `var item = await ${this._frame}.waitForXPath('//${tagName}[normalize-space() = "${innerText}"]', {visible: ${this._options.waitTillVisible}})`})
    return block
  }

  _handleEnter(selector) {
    const block = new Block(this._frameId)
    block.addLine({value: `await page.keyboard.press('Enter');`})
    return block
  }

  _addWaitForSelector(block, selector) {
    block.addLine({ type: domEvents.CLICK, value: `var item = await ${this._frame}.waitForSelector('${selector}', {visible: ${this._options.waitTillVisible}})` })
    block.addLine({ type: domEvents.CLICK, value: `await item.asElement().click('${selector}')` })
  }

  _handleKeyDown (selector, value) {
    const block = new Block(this._frameId)
    block.addLine({ value: `var item = await ${this._frame}.waitForSelector('${selector}', {visible: ${this._options.waitTillVisible}})` })
    block.addLine({ value: `await item.asElement().type('${value}')`})
    return block
  }

  _handleClick (selector) {
    const block = new Block(this._frameId)
    if (this._options.waitForSelectorOnClick) {
      block.addLine({ value: `var item = await ${this._frame}.waitForSelector('${selector}', {visible: ${this._options.waitTillVisible}})` })
      block.addLine({ value: `await item.asElement().click('${selector}')` })
    } else {
      block.addLine({ value: `await ${this._frame}.click('${selector}')` })
    }
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
