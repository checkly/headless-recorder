import domEvents from './dom-events-to-record'
import pptrActions from './pptr-actions'
import Block from './Block'

const importPuppeteer = `const puppeteer = require('puppeteer');\n`

const methodWaitTillVisible = `const waitTillVisible = function(selector, innerText) {
    const elements = document.querySelectorAll(selector);
    if (elements.length == 0) return false;
    for (var i in elements) {
        var e = elements[i];
        const style = window.getComputedStyle(e);
        if(style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && e.offsetHeight){
            if(innerText && e.innerText.trim() != innerText) {
              return false
            }
            return e;
        } else {
            return false;
        }
    }
}\n\n`

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
  waitTillVisibleOnClick: false,
  blankLinesBetweenBlocks: true,
  addWait: 2000,
  typingTerminator: 9
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
    return importPuppeteer + methodWaitTillVisible + this._getHeader() + this._parseEvents(events) + this._getFooter()
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
        case 'add-wait*':
          this._blocks.push(this._handleAddWait(this._options.addWait))
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

  _handleAddWait(period) {
    const block = new Block(this._frameId)
    block.addLine({ value: `await page.waitFor(${period});`})
    return block
  }

  _handleClickText(selector, innerText) {
    const block = new Block(this._frameId)
    this._addWaitTillVisible(block, selector, innerText)
    block.addLine({ value: `await item.asElement().click()`})
    return block
  }

  _handleEnter(selector) {
    const block = new Block(this._frameId)
    block.addLine({value: `await page.keyboard.press('Enter');`})
    return block
  }

  _addWaitTillVisible(block, selector, innerText) {
    if(innerText) {
      block.addLine({ value: `var item = await ${this._frame}.waitFor(waitTillVisible, {}, '${selector}', '${innerText}')`})
    } else {
      block.addLine({ value: `var item = await ${this._frame}.waitFor(waitTillVisible, {}, '${selector}')`})
    }
  }

  _addWaitForSelector(block, selector) {
    block.addLine({ type: domEvents.CLICK, value: `await ${this._frame}.waitForSelector('${selector}')` })
    block.addLine({ type: domEvents.CLICK, value: `await ${this._frame}.click('${selector}')` })
  }

  _handleKeyDown (selector, value) {
    const block = new Block(this._frameId)
    this._addWaitTillVisible(block, selector)
    block.addLine({ value: `await item.asElement().type('${value}')`})
    return block
  }

  _handleClick (selector) {
    const block = new Block(this._frameId)
    if (this._options.waitForSelectorOnClick) {
      this._addWaitForSelector(block, selector)
    } else if (this._options.waitTillVisibleOnClick) {
      this._addWaitTillVisible(block, selector)
      block.addLine({ value: `await item.asElement().click()`})
    }else {
      block.addLine({ type: domEvents.CLICK, value: `await ${this._frame}.click('${selector}')` })
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
