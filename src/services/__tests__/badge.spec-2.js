import badge from '../badge'

global.chrome = {
  browserAction: {
      setIcon: jest.fn(),
      setBadgeText: jest.fn((text) => (inputText.data = text)),
  }
}; 

const inputText = {
  data: '',
};

describe('start', () => {
  beforeEach(() => {
    chrome.browserAction.setIcon.mockClear()
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
})