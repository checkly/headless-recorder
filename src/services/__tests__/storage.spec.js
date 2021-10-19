import storage from '../storage'

const store = {
  token: 'xxx',
  name: 'lionel',
}

beforeEach(() => {
  window.chrome = {
    storage: {
      local: {
        get: jest.fn((keys, cb) => {
          if (typeof keys === 'string') {
            return cb(store[keys])
          }
  
          const results = []
          if (Array.isArray(keys)) {
            keys.forEach(key => {
              results.push(store[key])
            })
    
            return cb(results)
          }
        }),
        remove: jest.fn((keys, cb) => {
            delete store[keys];
            return cb(store)
        }),
        set: jest.fn((props, cb) => {
          const newStore = { ...store, ...props }
          return cb(newStore)
      }),
      },
    },
  }

  window.chrome.storage.local.get.mockClear()
  window.chrome.storage.local.set.mockClear()
  window.chrome.storage.local.remove.mockClear()
})

describe('get', () => {
  it('return a single value', async () => {
    const token = await storage.get('token')
    expect(token).toBe(store.token)
    expect(window.chrome.storage.local.get.mock.calls.length).toBe(1)
  })

  it('return multiple values', async () => {
    const [token, name] = await storage.get(['token', 'name'])
    expect(token).toBe(store.token)
    expect(name).toBe(store.name)
    expect(window.chrome.storage.local.get.mock.calls.length).toBe(1)
  })

  it('return undefined when value not found', async () => {
    const nothing = await storage.get('nothing')
    expect(nothing).toBe(undefined)
  })

  it('does not have browser storage available', async () => {
    try {
      window.chrome.storage = null
      await storage.get('token');
    } catch (e) {
      expect(e).toEqual('Browser storage not available');
    }
  })
})

describe('remove', () => {
  it('removes a value', async () => {
    const store = await storage.remove('token')
    expect(store.token).toBe(undefined)
    expect(window.chrome.storage.local.remove.mock.calls.length).toBe(1)
  })

  it('does not have browser storage available', async () => {
    try {
      window.chrome.storage = null
      await storage.remove('token');
    } catch (e) {
      expect(e).toEqual('Browser storage not available');
    }
  })
})

describe('set', () => {
  it('set a new value or values', async () => {
    const newStore = await storage.set({age: 1, country: 2})
    expect(newStore.age).toBe(1)
    expect(newStore.country).toBe(2)
    expect(window.chrome.storage.local.set.mock.calls.length).toBe(1)
  })

  it('does not have browser storage available', async () => {
    try {
      window.chrome.storage = null
      await storage.set({age: 1, country: 2});
    } catch (e) {
      expect(e).toEqual('Browser storage not available');
    }
  })
})
