import analytics from '../analytics'

Object.defineProperty(window, '_gaq', {
  writable: true,
  value: {
    push: jest.fn(),
  },
})

describe('trackPageView', () => {
  beforeEach(() => {
    window._gaq.push.mockClear()
  })

  it('has telemetry enabled', () => {
    const options = {
      extension: {
        telemetry: true,
      },
    }

    analytics.trackPageView(options)
    expect(window._gaq.push.mock.calls.length).toBe(1)
  })

  it('does not have telemetry enabled', () => {
    const options = {
      extension: {
        telemetry: false,
      },
    }

    analytics.trackPageView(options)
    expect(window._gaq.push.mock.calls.length).toBe(0)
  })
})