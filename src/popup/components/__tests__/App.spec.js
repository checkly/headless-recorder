import { createLocalVue, shallowMount } from '@vue/test-utils'
import App from '../App'

const chrome = {
  storage: {
    local: {
      get: jest.fn()
    }
  },
  extension: {
    connect: jest.fn()
  }
}

const mocks = { $chrome: chrome }

describe('App.vue', () => {
  let localVue
  beforeEach(() => {
    localVue = createLocalVue()
    localVue.directive('highlightjs', () => {})
    localVue.directive('clipboard', () => {})
  })

  test('it has the correct pristine / empty state', () => {
    const wrapper = shallowMount(App, { mocks, localVue })
    expect(wrapper.element).toMatchSnapshot()
  })
})
