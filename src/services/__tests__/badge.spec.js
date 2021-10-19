import badge from '../badge'

global.chrome = {
  browserAction: {
    setIcon: jest.fn(),
    setBadgeText: jest.fn(text => (inputText.data = text)),
    setBadgeBackgroundColor: jest.fn(),
  },
}

const inputText = {
  data: '',
}

beforeEach(() => {
  chrome.browserAction.setIcon.mockClear()
  chrome.browserAction.setBadgeBackgroundColor.mockClear()
})

describe('start', () => {
  it('sets recording icon', () => {
    badge.start()
    expect(chrome.browserAction.setIcon.mock.calls.length).toBe(1)
  })
})

describe('pause', () => {
  it('sets pause icon', () => {
    badge.pause()
    expect(chrome.browserAction.setIcon.mock.calls.length).toBe(1)
  })
})

describe('setText', () => {
  it('sets selected text on the badge', () => {
    badge.setText('data')
    expect(inputText.data.text).toBe('data')
  })
})

describe('reset', () => {
  it('reset text to empty string', () => {
    badge.reset()
    badge.setText('')
    expect(inputText.data.text).toBe('')
  })
})

describe('wait', () => {
  it('changes text to wait', () => {
    badge.wait()
    badge.setText('wait')
    expect(chrome.browserAction.setBadgeBackgroundColor.mock.calls.length).toBe(1)
    expect(inputText.data.text).toBe('wait')
  })
})

describe('stop', () => {
  it('stops recording and sets result text', () => {
    badge.stop('data')
    expect(chrome.browserAction.setIcon.mock.calls.length).toBe(1)
    expect(chrome.browserAction.setBadgeBackgroundColor.mock.calls.length).toBe(1)
    expect(inputText.data.text).toBe('data')
  })
})
