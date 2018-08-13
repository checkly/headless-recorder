import CodeGenerator from '../CodeGenerator'

describe('code-generator', () => {
  test('it should generate nothing when there are no events', () => {
    const codeGenerator = new CodeGenerator()
    const events = []
    expect(codeGenerator._parseEvents(events)).toBeFalsy()
  })
})
