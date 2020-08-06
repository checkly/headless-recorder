import PlaywrightCodeGenerator from '../PlaywrightCodeGenerator'

describe('PlaywrightCodeGenerator', () => {
  test('it should generate nothing when there are no events', () => {
    const events = []
    const codeGenerator = new PlaywrightCodeGenerator()
    expect(codeGenerator._parseEvents(events)).toBeFalsy()
  })
})
