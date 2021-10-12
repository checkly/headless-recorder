import storage from '../storage'

window.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, cb) => {
        if (typeof keys === 'string') {
          return cb(store[keys])
        }

        // TODO: verify that keys is an array
        const results = []
        keys.forEach(key => {
          results.push(store[key])
        })

        return cb(results)
      }),
    },
  },
}

const store = {
  token: 'xxx',
  name: 'lionel',
}

describe('get', () => {
  beforeEach(() => {})

  it('return a single value', async () => {
    const token = await storage.get('token')
    expect(token).toBe(store.token)
    expect(window.chrome.storage.local.get.mock.calls.length).toBe(1)
  })

  it('return multiple values', async () => {
    const [token, name] = await storage.get(['token', 'name'])
    expect(token).toBe(store.token)
    expect(name).toBe(store.name)
    // expect(window.chrome.storage.local.get.mock.calls.length).toBe(1)
  })

  it('return undefined when value not found', async () => {
    const nothing = await storage.get('nothing')
    expect(nothing).toBe(undefined)
  })
})
