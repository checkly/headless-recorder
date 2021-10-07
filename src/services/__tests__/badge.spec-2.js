import badge from '../badge'

global.chrome = {
  browserAction: {
      setIcon: jest.fn(),
  }
}; 

// function setMockText(text) {
//   Object.defineProperty(global.chrome, 'browserAction', {
//     writable: true,
//     value: {
//       setBadgeText: jest.fn(() => (inputText = text)),
//     },
//   })
// }

describe('start', () => {
  beforeEach(() => {
    chrome.browserAction.setIcon.mockClear()
  })

  beforeAll(() => {
    const inputText = ''
  })

  it('sets recording logo', () => {   
    badge.start()
    expect(chrome.browserAction.setIcon.mock.calls.length).toBe(1)
  })

  it('sets pause logo', () => {   
    badge.pause()
    expect(chrome.browserAction.setIcon.mock.calls.length).toBe(1)
  })

  // it('sets badge text', () => {   
  //   setMockText("hola")
  //   expect(chrome.browserAction.setBadgeText()).toBe(true)
  // })
})
