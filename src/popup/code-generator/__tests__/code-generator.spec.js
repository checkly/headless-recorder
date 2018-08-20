import CodeGenerator from '../CodeGenerator'

describe('code-generator', () => {
  test('it should generate nothing when there are no events', () => {
    const events = []
    const codeGenerator = new CodeGenerator()
    expect(codeGenerator._parseEvents(events)).toBeFalsy()
  })

  test('it generates the correct waitForNavigation code', () => {
    const events = [{ action: 'navigation*' }, { action: 'click', selector: 'a.link' }]
    const codeGenerator = new CodeGenerator()
    expect(codeGenerator._parseEvents(events)).toContain('const navigationPromise = page.waitForNavigation()\n')
    expect(codeGenerator._parseEvents(events)).toContain('await navigationPromise\n')
  })

  test('it does not generate waitForNavigation code when turned off', () => {
    const events = [{ action: 'navigation*' }, { action: 'click', selector: 'a.link' }]
    const codeGenerator = new CodeGenerator({ waitForNavigation: false })
    expect(codeGenerator._parseEvents(events)).not.toContain('const navigationPromise = page.waitForNavigation()\n')
    expect(codeGenerator._parseEvents(events)).not.toContain('await navigationPromise\n')
  })
})
