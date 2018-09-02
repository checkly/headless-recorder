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
