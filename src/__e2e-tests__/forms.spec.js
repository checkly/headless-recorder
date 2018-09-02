import puppeteer from 'puppeteer'
import express from 'express'
import path from 'path'
import { launchPuppeteerWithExtension, waitForRecorderEvents, getEventLog, cleanEventLog } from './helpers'

let server
let browser
let page

beforeAll(done => {
  const app = express()
  const buildDir = process.env.NODE_ENV === 'development' ? '../../build' : '../../dist'
  app.use('/build', express.static(path.join(__dirname, buildDir)))
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
  await page.goto('http://localhost:3000/')
  await cleanEventLog(page)
})

afterEach(async () => {
  browser.close()
})

describe('forms', () => {
  test('It should record clicks on text input elements', async () => {
    const form = await page.$('form')
    expect(form).toBeTruthy()

    await page.click('input[type="text"]')
    await waitForRecorderEvents(page)
    const eventLog = await getEventLog(page)

    expect(eventLog.length).toBeGreaterThan(0)
  })
})
