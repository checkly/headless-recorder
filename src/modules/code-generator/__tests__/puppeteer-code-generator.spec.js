import PuppeteerCodeGenerator from '../puppeteer'
import { headlessActions } from '@/services/constants'

describe('PuppeteerCodeGenerator', () => {
  test('it should generate nothing when there are no events', () => {
    const events = []
    const codeGenerator = new PuppeteerCodeGenerator()
    expect(codeGenerator._parseEvents(events)).toBeFalsy()
  })

  test('it generates a page.select() only for select dropdowns', () => {
    const events = [
      {
        action: 'change',
        selector: 'select#animals',
        tagName: 'SELECT',
        value: 'hamster',
      },
    ]
    const codeGenerator = new PuppeteerCodeGenerator()
    expect(codeGenerator._parseEvents(events)).toContain(
      "await page.select('select#animals', 'hamster')"
    )
  })

  test('it generates the correct waitForNavigation code', () => {
    const events = [{ action: 'click', selector: 'a.link' }, { action: headlessActions.NAVIGATION }]
    const codeGenerator = new PuppeteerCodeGenerator()
    const code = codeGenerator._parseEvents(events)
    const lines = code.split('\n')
    expect(lines[1].trim()).toEqual('const navigationPromise = page.waitForNavigation()')
    expect(lines[4].trim()).toEqual("await page.click('a.link')")
    expect(lines[6].trim()).toEqual('await navigationPromise')
  })

  test('it does not generate waitForNavigation code when turned off', () => {
    const events = [{ action: 'navigation*' }, { action: 'click', selector: 'a.link' }]
    const codeGenerator = new PuppeteerCodeGenerator({
      waitForNavigation: false,
    })
    expect(codeGenerator._parseEvents(events)).not.toContain(
      'const navigationPromise = page.waitForNavigation()\n'
    )
    expect(codeGenerator._parseEvents(events)).not.toContain('await navigationPromise\n')
  })

  test('it generates the correct waitForSelector code before clicks', () => {
    const events = [{ action: 'click', selector: 'a.link' }]
    const codeGenerator = new PuppeteerCodeGenerator()
    const result = codeGenerator._parseEvents(events)

    expect(result).toContain("await page.waitForSelector('a.link')")
    expect(result).toContain("await page.click('a.link')")
  })

  test('it does not generate the waitForSelector code before clicks when turned off', () => {
    const events = [{ action: 'click', selector: 'a.link' }]
    const codeGenerator = new PuppeteerCodeGenerator({
      waitForSelectorOnClick: false,
    })
    const result = codeGenerator._parseEvents(events)

    expect(result).not.toContain("await page.waitForSelector('a.link')")
    expect(result).toContain("await page.click('a.link')")
  })

  test('it uses the default page frame when events originate from frame 0', () => {
    const events = [
      {
        action: 'click',
        selector: 'a.link',
        frameId: 0,
        frameUrl: 'https://some.site.com',
      },
    ]
    const codeGenerator = new PuppeteerCodeGenerator()
    const result = codeGenerator._parseEvents(events)
    expect(result).toContain("await page.click('a.link')")
  })

  test('it uses a different frame when events originate from an iframe', () => {
    const events = [
      {
        action: 'click',
        selector: 'a.link',
        frameId: 123,
        frameUrl: 'https://some.iframe.com',
      },
    ]
    const codeGenerator = new PuppeteerCodeGenerator()
    const result = codeGenerator._parseEvents(events)
    expect(result).toContain("await frame_123.click('a.link')")
  })

  test('it adds a frame selection preamble when events originate from an iframe', () => {
    const events = [
      {
        action: 'click',
        selector: 'a.link',
        frameId: 123,
        frameUrl: 'https://some.iframe.com',
      },
    ]
    const codeGenerator = new PuppeteerCodeGenerator()
    const result = codeGenerator._parseEvents(events)
    expect(result).toContain('let frames = await page.frames()')
    expect(result).toContain(
      "const frame_123 = frames.find(f => f.url() === 'https://some.iframe.com'"
    )
  })

  test('it generates the correct current page screenshot code', () => {
    const events = [{ action: headlessActions.SCREENSHOT }]
    const codeGenerator = new PuppeteerCodeGenerator()
    const result = codeGenerator._parseEvents(events)

    expect(result).toContain("await page.screenshot({ path: 'screenshot_1.png' })")
  })

  test('it generates the correct clipped page screenshot code', () => {
    const events = [
      {
        action: headlessActions.SCREENSHOT,
        value: { x: '10px', y: '300px', width: '800px', height: '600px' },
      },
    ]
    const codeGenerator = new PuppeteerCodeGenerator()
    const result = codeGenerator._parseEvents(events)

    expect(result).toContain(
      "await page.screenshot({ path: 'screenshot_1.png', clip: { x: 10, y: 300, width: 800, height: 600 } })"
    )
  })

  test('it generates the correct escaped value', () => {
    const events = [
      {
        action: 'keydown',
        keyCode: 9,
        selector: 'input.value',
        value: "hello');console.log('world",
      },
    ]
    const codeGenerator = new PuppeteerCodeGenerator()
    const result = codeGenerator._parseEvents(events)

    expect(result).toContain("await page.type('input.value', 'hello\\');console.log(\\'world')")
  })

  test('it generates the correct escaped value with backslash', () => {
    const events = [{ action: 'click', selector: 'button.\\hello\\' }]
    const codeGenerator = new PuppeteerCodeGenerator()
    const result = codeGenerator._parseEvents(events)

    expect(result).toContain("await page.click('button.\\\\hello\\\\')")
  })
})
