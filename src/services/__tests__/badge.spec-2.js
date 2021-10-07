import badge from '../badge'

global.chrome = {
  browserAction: {
      setIcon: jest.fn(),
      setBadgeText: jest.fn((text) => (inputText.data = text)),
      setBadgeBackgroundColor: jest.fn(),
  }
}; 

const inputText = {
  data: '',
};

describe('badge', () => {
  beforeEach(() => {
    chrome.browserAction.setIcon.mockClear()
    chrome.browserAction.setBadgeBackgroundColor.mockClear()
  })

  it('sets recording logo', () => {   
    badge.start()
    expect(chrome.browserAction.setIcon.mock.calls.length).toBe(1)
  })

  it('sets pause logo', () => {   
    badge.pause()
    expect(chrome.browserAction.setIcon.mock.calls.length).toBe(1)
  })

  it('sets text', () => {   
    badge.setText('data')
    expect(inputText.data.text).toBe('data')
  })

  it('reset text', () => {   
    badge.reset()
    badge.setText('')
    expect(inputText.data.text).toBe('')
  })

  it('wait', () => {   
    badge.wait()
    badge.setText('wait')
    expect(chrome.browserAction.setBadgeBackgroundColor.mock.calls.length).toBe(1)
    expect(inputText.data.text).toBe('wait')
  })

  it('stop', () => {   
    badge.stop('data')
    expect(chrome.browserAction.setIcon.mock.calls.length).toBe(1)
    expect(chrome.browserAction.setBadgeBackgroundColor.mock.calls.length).toBe(1)
    expect(inputText.data.text).toBe('data')
  })
})
