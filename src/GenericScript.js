const fs = require('fs')
const puppeteer = require('puppeteer')
const USKeyboardLayout = require('puppeteer/lib/USKeyboardLayout')
const KeyCodeToName = Object.keys(USKeyboardLayout).reduce((acc, name) => {
  acc[USKeyboardLayout[name].keyCode] = name
  return acc
}, {})

const defaults = {
  waitForNavigation: true,
  waitForSelectorOnClick: true,
}

async function run(events, options = {}, optionsForLaunch = {headless: false}) {
  this.browser = await puppeteer.launch(optionsForLaunch)
  this.page = await browser.newPage()
  this._options = Object.assign(defaults, options)
  this._blocks = []

  this._handleKeyDown = async function (selector, key) {
    await this.page.keyboard.down(key)
  }

  this._handleKeyUp = async function (selector, key) {
    await this.page.keyboard.up(key)
  }

  this._handleClick = async function (selector) {
    if (this._options.waitForSelectorOnClick) {
      await this.page.waitForSelector(selector)
    } else {
      await this.page.click(selector)
    }
  }
  this._handleChange = async function (selector, value) {
    await this.page.select(selector, value)
  }
  this._handleGoto = async function (href) {
    await this.page.goto(href)
  }

  this._handleViewport = async function (width, height) {
    await this.page.setViewport({ width, height })
  }

  this._handleWaitForNavigation = async function () {
    if (this._options.waitForNavigation) {
      try {
        await this.page.waitForNavigation()
      } catch (error) {
        console.error(error)
      }
    }
  }

  this._doEvents = async function (events) {
    console.debug(`executing ${events ? events.length : 0} events`)

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const { action, selector, value, href, key, code, keyCode, tagName, frameId, frameUrl } = event
      console.debug(event)
      switch (action) {
        case 'keydown':
          await this._handleKeyDown(selector, key)
          break
        case 'keyup':
          if (events[i+1] && events[i+1].action === 'navigation*') {
            const [response] = await Promise.all([
              this.page.waitForNavigation(),
              this._handleKeyUp(selector, key)
            ]);
            i++
          } else {
            await this._handleKeyUp(selector, key)
          }
          break
        case 'click':
          if (events[i+1] && events[i+1].action === 'navigation*') {
            const [response] = await Promise.all([
              this.page.waitForNavigation(),
              this.page.click(selector),
            ]);
            i++
          } else {
            await this._handleClick(selector)
          }
          break
        case 'change':
          if (tagName === 'SELECT') {
            await this._handleChange(selector, value)
          }
          break
        case 'goto*':
          await this._handleGoto(href, frameId)
          break
        case 'viewport*':
          (await this._handleViewport(value.width, value.height))
          break
        case 'navigation*':
          await this._handleWaitForNavigation()
          break
      }
    }
  }
  await this._doEvents(events)
  await this.page.screenshot({path: 'screenshot.png'})
  await this.browser.close()
}

function main(){
  if (process.argv.length === 3) {
    run(JSON.parse(fs.readFileSync(process.argv[2])))
  } else{
    console.error("usage: node GenericScript.js data.json")
  }
}

if (require.main === module) {
  main();
}