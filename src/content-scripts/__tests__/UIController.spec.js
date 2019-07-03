import UIController from '../UIController'

describe('UIControler', () => {
  it('Shows and hides the selector', () => {
    const uic = new UIController()

    uic.showSelector()
    let overlay = document.querySelector('.pptrRecorderOverlay')
    let outline = document.querySelector('.pptrRecorderOutline')

    expect(overlay).toBeDefined()
    expect(outline).toBeDefined()

    uic.hideSelector()
    overlay = document.querySelector('.pptrRecorderOverlay')
    outline = document.querySelector('.pptrRecorderOutline')

    expect(overlay).toBeNull()
    expect(outline).toBeNull()
  })

  it('Registers mouse events', () => {
    jest.useFakeTimers()

    document.body.innerHTML =
      '<div>' +
      '  <div id="username">UserName</div>' +
      '  <button id="button"></button>' +
      '</div>'

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
})

