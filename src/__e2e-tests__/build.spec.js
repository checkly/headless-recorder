import puppeteer from 'puppeteer'
import { scripts } from '../../package.json'
import { launchPuppeteerWithExtension } from './helpers'

const util = require('util')
const exec = util.promisify(require('child_process').exec)

describe('build & install', () => {
  test('it builds the extension', async () => {
    const { stderr } = await exec(scripts.dist)
    expect(stderr).toBeFalsy()
  }, 60000)

  test('it installs the extension', async () => {
    const browser = await launchPuppeteerWithExtension(puppeteer)
    expect(browser).toBeTruthy()
    browser.close()
  }, 5000)
})
