import { createLocalVue, mount } from '@vue/test-utils'
import App from '../App'

function createChromeLocalStorageMock (options) {
  let ops = options || {}
  return {
    options,
    storage: {
      local: {
        get: (key, cb) => { return cb(ops) },
        set: (options, cb) => {
          ops = options
          cb()
        }
      }
    }
  }
}

describe('App.vue', () => {
  let localVue
  beforeEach(() => { localVue = createLocalVue() })

  test('it has the correct pristine / empty state', () => {
    const mocks = { $chrome: createChromeLocalStorageMock() }
    const wrapper = mount(App, { mocks, localVue })
    expect(wrapper.element).toMatchSnapshot()
  })

  test('it loads the default options', () => {
    const mocks = { $chrome: createChromeLocalStorageMock() }
    const wrapper = mount(App, { mocks, localVue })
    expect(wrapper.vm.$data.options.code.wrapAsync).toBeTruthy()
  })

  test('it stores and loads the user\'s edited options', () => {
    const options = { code: { wrapAsync: true } }
    const mocks = { $chrome: createChromeLocalStorageMock(options) }
    const wrapper = mount(App, { mocks, localVue })
    return wrapper.vm.$nextTick()
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
