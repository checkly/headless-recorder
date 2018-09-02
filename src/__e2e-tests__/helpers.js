import path from 'path'

const extensionPath = path.join(__dirname, '../../dist')

export const launchPuppeteerWithExtension = function (puppeteer) {
  const options = {
    headless: false,
    ignoreHTTPSErrors: true,
    devtools: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  }
  return puppeteer.launch(options)
}

export const waitForRecorderEvents = function (page, amount) {
  return page.waitForFunction(`window.eventRecorder.getEventLog().length >= ${amount || 1}`)
}

export const getEventLog = function (page) {
  return page.evaluate(() => { return window.eventRecorder.getEventLog() })
}

export const cleanEventLog = function (page) {
  return page.evaluate(() => { return window.eventRecorder.clearEventLog() })
}
