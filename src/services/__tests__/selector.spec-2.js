import selector from '../selector'

describe('selector', () => {
  it('has id', () => {
    const e = {
      target: {
        id: 1,
      },
    }
    expect(selector(e)).toBe(true)
  })

  it('has dataAttribute', () => {
    e.target = {
          getAttribute: jest.fn(props => (props)),
        },
    expect(selector(e, {dataAttribute: true})).toBe(true)
  })
})

