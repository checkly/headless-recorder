import puppeteer from 'puppeteer'
import { launchPuppeteerWithExtension, runDist } from './helpers'

describe('build & install', () => {
  test('it builds the extension', async () => {
    const { stderr } = await runDist()
    expect(stderr).toBeFalsy()
  }, 60000)

  test('it installs the extension', async () => {
    const browser = await launchPuppeteerWithExtension(puppeteer)
    expect(browser).toBeTruthy()
    browser.close()
  }, 5000)
})
