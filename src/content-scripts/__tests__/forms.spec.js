import puppeteer from 'puppeteer'
import _ from 'lodash'
import { launchPuppeteerWithExtension } from '../../__e2e-tests__/helpers'
import { waitForAndGetEvents, cleanEventLog, startServer } from './helpers'

let server
let browser
let page

describe('forms', () => {
  test('it should load the form', async () => {
    const form = await page.$('form')
    expect(form).toBeTruthy()
  })

  test('it should record text input elements', async () => {
    const string = 'I like turtles'
    await page.type('input[type="text"]', string)
    await page.keyboard.press('Tab')

    const eventLog = await waitForAndGetEvents(page, string.length)
    const event = _.find(eventLog, e => { return e.action === 'keydown' && e.keyCode === 9 })
    expect(event.value).toEqual(string)
  })

  test('it should record textarea elements', async () => {
    const string = 'I like turtles\n but also cats'
    await page.type('textarea', string)
    await page.keyboard.press('Tab')

    const eventLog = await waitForAndGetEvents(page, string.length)
    const event = _.find(eventLog, e => { return e.action === 'keydown' && e.keyCode === 9 })
    expect(event.value).toEqual(string)
  })

  test('it should record radio input elements', async () => {
    await page.click('#radioChoice1')
    await page.click('#radioChoice3')
    const eventLog = await waitForAndGetEvents(page, 2)
    expect(eventLog[0].value).toEqual('radioChoice1')
    expect(eventLog[1].value).toEqual('radioChoice3')
  })
})

beforeAll(async (done) => {
  const buildDir = process.env.NODE_ENV === 'production' ? '../../../dist' : '../../../build'
  const fixture = './fixtures/forms.html'
  server = await startServer(buildDir, fixture)
  return done()
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
