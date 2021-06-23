import UIController from '../shooter'

// this test NEEDS to come first because of shitty JSDOM.
// See https://github.com/facebook/jest/issues/1224
it('Registers mouse events', () => {
  jest.useFakeTimers()

  document.body.innerHTML =
    '<div>' + '  <div id="username">UserName</div>' + '  <button id="button"></button>' + '</div>'

  const uic = new UIController()
  uic.showSelector()

  const handleClick = jest.fn()
  uic.on('click', handleClick)

  const el = document.querySelector('#username')
  el.click()

  jest.runAllTimers()

  expect(setTimeout).toHaveBeenCalledTimes(1)
  expect(handleClick).toHaveBeenCalled()
})

it('Shows and hides the selector', () => {
  const uic = new UIController()

  uic.showSelector()
  let overlay = document.querySelector('.headlessRecorderOverlay')
  let outline = document.querySelector('.headlessRecorderOutline')

  expect(overlay).toBeDefined()
  expect(outline).toBeDefined()

  uic.hideSelector()
  overlay = document.querySelector('.headlessRecorderOverlay')
  outline = document.querySelector('.headlessRecorderOutline')

  expect(overlay).toBeNull()
  expect(outline).toBeNull()
})
