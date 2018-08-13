import { mount } from '@vue/test-utils'
import Vue from 'vue'
import App from '../App'

beforeAll(() => {
  global.chrome = {
    storage: {
      local: {
        get: jest.fn()
      }
    },
    extension: {
      connect: jest.fn()
    }
  }
})

describe('App.vue', () => {
  let Cmp, vm

  beforeEach(() => {
    Cmp = Vue.extend(App)
    vm = new Cmp().$mount()
  })

  test('it has the correct pristine / empty state', () => {
    expect(vm.$el).toMatchSnapshot()
  })
})
