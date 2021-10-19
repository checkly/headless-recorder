import browser from '../browser'

const activeTab = { id: 1, active: true }

const copyText = {
  data: '',
}

const cookies = [
    {
      name: 'checkly'
    }
  ]


window.chrome = {
  tabs: {
    create: jest.fn(),
    query: jest.fn((options, cb) => (cb([activeTab]))),
    executeScript: jest.fn((options, cb) => (cb(options))),
    sendMessage: jest.fn(),
  },
  extension: {
    connect: jest.fn(),
  },
  runtime: {
    openOptionsPage: jest.fn()
  },
  cookies: {
    getAll: jest.fn((options, cb) => (cb(cookies)))
}}

global.navigator.permissions = {
  query: jest
    .fn()
    .mockImplementationOnce(() => Promise.resolve({ state: 'granted' })),
};

global.navigator.clipboard = {
  writeText: jest.fn(text => (copyText.data = text))
};

beforeEach(() => {
  window?.chrome?.tabs.create.mockClear()
  window?.chrome?.extension.connect.mockClear()
  window?.chrome?.runtime.openOptionsPage.mockClear()
  window?.chrome?.tabs.query.mockClear()
})

describe('getActiveTab', () => {
  it('returns the active tab', async () => {
    const activeTab = await browser.getActiveTab()
    expect(activeTab).toBe(activeTab)
    expect(window.chrome.tabs.query.mock.calls.length).toBe(1)
  })
})

describe('copyToClipboard', () => {
  it('copies text to clipboard', async () => {
    await browser.copyToClipboard('data')
    expect(window.navigator.clipboard.writeText.mock.calls.length).toBe(1)
  })
})

describe('injectContentScript', () => {
  it('executes content script', async () => {
    await browser.injectContentScript()
    expect(window.chrome.tabs.executeScript.mock.calls.length).toBe(1)
  })
})

describe('getChecklyCookie', () => {
  it('returns checkly cookie', async () => {
    await browser.getChecklyCookie()
    expect(window.chrome.cookies.getAll.mock.calls.length).toBe(1)
  })
})

describe('openChecklyRunner', () => {
  it('is not logged in', () => {
    browser.openChecklyRunner({code: 1, runner: 2, isLoggedIn: false})
    expect(window.chrome.tabs.create.mock.calls.length).toBe(1)
  })

  it('is logged in', () => {
    browser.openChecklyRunner({code: 1, runner: 2, isLoggedIn: true})
    expect(window.chrome.tabs.create.mock.calls.length).toBe(1)
  })
})

describe('getBackgroundBus', () => {
  it('gets backgorund bus', async () => {
    browser.getBackgroundBus()
    expect(window.chrome.extension.connect.mock.calls.length).toBe(1)
  })
})

describe('openOptionsPage', () => {
  it('calls function that opens options page', async () => {
    browser.openOptionsPage()
    expect(window.chrome.runtime.openOptionsPage.mock.calls.length).toBe(1)
  })
})

describe('openHelpPage', () => {
  it('calls function that creates new tab and opens help page', async () => {
    browser.openHelpPage()
    expect(window.chrome.tabs.create.mock.calls.length).toBe(1)
  })
})


