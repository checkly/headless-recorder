import puppeteer from 'puppeteer'
import { launchPuppeteerWithExtension } from '@/__tests__/helpers'
import { waitForAndGetEvents, cleanEventLog, startServer } from './helpers'

let server
let port
let browser
let page

describe('attributes', () => {
  beforeAll(async done => {
    const buildDir = '../../../dist'
    const fixture = './fixtures/attributes.html'
    {
      const { server: _s, port: _p } = await startServer(buildDir, fixture)
      server = _s
      port = _p
    }
    return done()
  }, 20000)

  afterAll(done => {
    server.close(() => {
      return done()
    })
  })

  beforeEach(async () => {
    browser = await launchPuppeteerWithExtension(puppeteer)
    page = await browser.newPage()
    await page.goto(`http://localhost:${port}/`)
    await cleanEventLog(page)
  })

  afterEach(async () => {
    browser.close()
  })

  test('it should load the content', async () => {
    const content = await page.$('#content-root')
    expect(content).toBeTruthy()
  })

  test('it should use data attributes throughout selector', async () => {
    await page.evaluate('window.eventRecorder._dataAttribute = "data-qa"')
    await page.click('span')

    const event = (await waitForAndGetEvents(page, 1))[0]
    expect(event.selector).toEqual(
      'body > #content-root > [data-qa="article-wrapper"] > [data-qa="article-body"] > span'
    )
  })

  test('it should use data attributes throughout selector even when id is set', async () => {
    await page.evaluate('window.eventRecorder._dataAttribute = "data-qa"')
    await page.click('#link')

    const event = (await waitForAndGetEvents(page, 1))[0]
    expect(event.selector).toEqual('[data-qa="link"]')
  })

  test('it should use id throughout selector when data attributes is not set', async () => {
    await page.evaluate('window.eventRecorder._dataAttribute = null')
    await page.click('#link')

    const event = (await waitForAndGetEvents(page, 1))[0]
    expect(event.selector).toEqual('#link')
  })
})
