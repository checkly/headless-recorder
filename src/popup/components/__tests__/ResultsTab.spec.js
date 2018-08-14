import { createLocalVue, mount } from '@vue/test-utils'
import ResultsTab from '../ResultsTab'

describe('RecordingTab.vue', () => {
  let localVue
  beforeEach(() => {
    localVue = createLocalVue()
    localVue.directive('highlightjs', () => {})
  })

  test('it has the correct pristine / empty state', () => {
    const wrapper = mount(ResultsTab, { localVue })
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.find('code.javascript').exists()).toBe(false)
  })

  test('it show a code box when there is code', () => {
    const wrapper = mount(ResultsTab, { localVue })
    wrapper.setProps({ code: `await page.click('.class')` })
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.find('code.javascript').exists()).toBe(true)
  })
})
