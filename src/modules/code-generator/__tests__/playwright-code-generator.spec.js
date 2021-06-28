import PlaywrightCodeGenerator from '../playwright'

describe('PlaywrightCodeGenerator', () => {
  test('it should generate nothing when there are no events', () => {
    const events = []
    const codeGenerator = new PlaywrightCodeGenerator()
    expect(codeGenerator._parseEvents(events)).toBeFalsy()
  })

  test('it generates a page.selectOption() only for select dropdowns', () => {
    const events = [
      {
        action: 'change',
        selector: 'select#animals',
        tagName: 'SELECT',
        value: 'hamster',
      },
    ]
    const codeGenerator = new PlaywrightCodeGenerator()
    expect(codeGenerator._parseEvents(events)).toContain(
      `await page.selectOption('${events[0].selector}', '${events[0].value}')`
    )
  })
})
