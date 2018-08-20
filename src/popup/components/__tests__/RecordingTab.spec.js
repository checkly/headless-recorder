import { mount } from '@vue/test-utils'
import RecordingTab from '../RecordingTab'

describe('RecordingTab.vue', () => {
  test('it has the correct pristine / empty state', () => {
    const wrapper = mount(RecordingTab)
    expect(wrapper.element).toMatchSnapshot()
  })

  test('it has the correct waiting for events state', () => {
    const wrapper = mount(RecordingTab)
    wrapper.setProps({ isRecording: true })
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.find('.event-list').isEmpty()).toBe(true)
  })

  test('it has the correct recording Puppeteer custom events state', () => {
    const wrapper = mount(RecordingTab)
    wrapper.setProps({
      isRecording: true,
      liveEvents: [{
        action: 'goto*',
        href: 'http://example.com'
      }, {
        action: 'viewport*',
        selector: undefined,
        value: { width: 1280, height: 800 }
      }, {
        action: 'navigation*',
        selector: undefined
      }]
    })
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.find('.event-list').isEmpty()).toBe(false)
  })

  test('it has the correct recording DOM events state', () => {
    const wrapper = mount(RecordingTab)
    wrapper.setProps({ isRecording: true, liveEvents: [{ action: 'click', selector: '.main > a.link', href: 'http://example.com' }] })
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.find('.event-list').isEmpty()).toBe(false)
  })
})
