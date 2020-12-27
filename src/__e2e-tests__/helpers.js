import { Console } from 'console'
import path from 'path'
import { scripts } from '../../package.json'
const util = require('util')
const exec = util.promisify(require('child_process').exec)

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

  console.log('---- DEBUG HERE ----')
  console.log(process.env.CI)

  if (process.env.CI) {
    options.executablePath = process.env.PUPPETEER_EXEC_PATH // Set by docker on github actions
  }

  return puppeteer.launch(options)
}

export const runDist = function () {
  return exec(scripts.dist)
}

export const runBuild = function () {
  return exec(scripts.build)
}
