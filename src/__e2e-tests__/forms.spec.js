import puppeteer from 'puppeteer'
import express from 'express'
import path from 'path'
import { launchPuppeteerWithExtension } from './helpers'

let server
let browser
let page

beforeAll(done => {
  const app = express()
  app.use('/build', express.static(path.join(__dirname, '../../build')))
  app.get('/', (req, res) => {
    res.status(200).sendFile('./fixtures/forms.html', { root: __dirname })
  })
  server = app.listen(3000, () => {
    return done()
  })
})

afterAll(done => {
  server.close(() => {
    return done()
  })
})

beforeEach(async () => {
  browser = await launchPuppeteerWithExtension(puppeteer)
  page = await browser.newPage()
})

afterEach(async () => {
  browser.close()
})

describe('forms', () => {
  test('It should record clicks on text input elements', async () => {
    await page.goto('http://localhost:3000/')

    const form = await page.$('form')
    expect(form).toBeTruthy()
    const watchDog = page.waitForFunction('window.eventRecorder.getEventLog().length >= 2')
    await page.click('input[type="text"]')
    await watchDog

    const eventLog = await page.evaluate(() => { return window.eventRecorder.getEventLog() })
    expect(eventLog.length).toBeGreaterThan(1)
  }, 20000)
})
