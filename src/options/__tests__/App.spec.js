import { mount } from '@vue/test-utils'
import App from '../OptionsApp'

function createChromeLocalStorageMock(options) {
  let ops = options || {}
  return {
    options,
    storage: {
      local: {
        get: (key, cb) => {
          return cb(ops)
        },
        set: (options, cb) => {
          ops = options
          cb()
        },
      },
    },
  }
}

describe('App.vue', () => {
  beforeEach(() => {
    window.chrome = null
  })

  test('it has the correct pristine / empty state', () => {
    window.chrome = createChromeLocalStorageMock()
    const wrapper = mount(App)
    expect(wrapper.element).toMatchSnapshot()
  })

  test('it loads the default options', () => {
    window.chrome = createChromeLocalStorageMock()
    const wrapper = mount(App)
    expect(wrapper.vm.$data.options.code.wrapAsync).toBeTruthy()
  })

  test('it has the default key code for capturing inputs as 9 (Tab)', () => {
    window.chrome = createChromeLocalStorageMock()
    const wrapper = mount(App)
    expect(wrapper.vm.$data.options.code.keyCode).toBe(9)
  })

  test('clicking the button will listen for the next keydown and update the key code option', () => {
    const options = { code: { keyCode: 9 } }
    window.chrome = createChromeLocalStorageMock(options)
    const wrapper = mount(App)

    return wrapper.vm
      .$nextTick()
      .then(() => {
        wrapper.find('button').element.click()
        const event = new KeyboardEvent('keydown', { keyCode: 16 })
        window.dispatchEvent(event)
        return wrapper.vm.$nextTick()
      })
      .then(() => {
        expect(wrapper.vm.$data.options.code.keyCode).toBe(16)
      })
  })

  test("it stores and loads the user's edited options", () => {
    const options = { code: { wrapAsync: true } }
    window.chrome = createChromeLocalStorageMock(options)
    const wrapper = mount(App)

    return wrapper.vm
      .$nextTick()
      .then(() => {
        const checkBox = wrapper.find('#options-code-wrapAsync')
        checkBox.trigger('click')
        expect(wrapper.find('.saving-badge').text()).toEqual('Saving...')
        return wrapper.vm.$nextTick()
      })
      .then(() => {
        // we need to simulate a page reload
        wrapper.vm.load()
        return wrapper.vm.$nextTick()
      })
      .then(() => {
        const checkBox = wrapper.find('#options-code-wrapAsync')
        return expect(checkBox.element.checked).toBeFalsy()
      })
  })
})
