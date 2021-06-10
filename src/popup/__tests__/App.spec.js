import { shallowMount } from '@vue/test-utils'
import App from '../PopupApp'

const chrome = {
  storage: {
    local: {
      get: jest.fn(),
    },
  },
  extension: {
    connect: jest.fn(),
  },
}

describe('App.vue', () => {
  test('it has the correct pristine / empty state', () => {
    window.chrome = chrome
    const wrapper = shallowMount(App)
    expect(wrapper.element).toMatchSnapshot()
  })
})
