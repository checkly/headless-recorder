import selector from '../selector'

describe('selector', () => {
  it('has id', () => {
    const e = {
      target: {
        id: 1,
      },
    }
    expect(selector(e)).toBe(`#1`)
  })
})

describe('selector', () => {
  it('has dataAttribute', () => {
    const dataAttribute = 'data'
    e.target.getAttribute = () => {
      return { dataAttribute: 'data' }
    }
    expect(selector(e.target.getAttribute(), dataAttribute)).toBe(
      `[${'data'}="${{ dataAttribute: 'data' }}"]`
    )
  })
})
