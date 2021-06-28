import getSelector from '@/services/selector'
import { recordingControls } from '@/services/constants'
import { overlaySelectors } from '@/modules/overlay/constants'
import { eventsToRecord } from '@/modules/code-generator/constants'

export default class Recorder {
  constructor({ store }) {
    // this._boundedMessageListener = null
    this._eventLog = []
    this._previousEvent = null

    this._isTopFrame = window.location === window.parent.location
    this._isRecordingClicks = true

    this.store = store
  }

  init(cb) {
    const events = Object.values(eventsToRecord)

    if (!window.pptRecorderAddedControlListeners) {
      this._addAllListeners(events)
      cb && cb()
      window.pptRecorderAddedControlListeners = true
    }

    if (!window.document.pptRecorderAddedControlListeners && chrome.runtime?.onMessage) {
      window.document.pptRecorderAddedControlListeners = true
    }

    if (this._isTopFrame) {
      this._sendMessage({ control: recordingControls.EVENT_RECORDER_STARTED })
      this._sendMessage({ control: recordingControls.GET_CURRENT_URL, href: window.location.href })
      this._sendMessage({
        control: recordingControls.GET_VIEWPORT_SIZE,
        coordinates: { width: window.innerWidth, height: window.innerHeight },
      })
    }
  }

  _addAllListeners(events) {
    const boundedRecordEvent = this._recordEvent.bind(this)
    events.forEach(type => window.addEventListener(type, boundedRecordEvent, true))
  }

  _sendMessage(msg) {
    // filter messages based on enabled / disabled features
    if (msg.action === 'click' && !this._isRecordingClicks) {
      return
    }

    try {
      chrome.runtime && chrome?.runtime?.onMessage
        ? chrome.runtime.sendMessage(msg)
        : this._eventLog.push(msg)
    } catch (err) {
      console.debug('caught error', err)
    }
  }

  _recordEvent(e) {
    if (this._previousEvent && this._previousEvent.timeStamp === e.timeStamp) {
      return
    }
    this._previousEvent = e

    // we explicitly catch any errors and swallow them, as none node-type events are also ingested.
    // for these events we cannot generate selectors, which is OK
    try {
      const selector = getSelector(e, { dataAttribute: this.store.state.dataAttribute })

      if (selector.includes('#' + overlaySelectors.OVERLAY_ID)) {
        return
      }

      this.store.commit('showRecorded')

      this._sendMessage({
        selector,
        value: e.target.value,
        tagName: e.target.tagName,
        action: e.type,
        keyCode: e.keyCode ? e.keyCode : null,
        href: e.target.href ? e.target.href : null,
        coordinates: Recorder._getCoordinates(e),
      })
    } catch (err) {
      console.error(err)
    }
  }

  _getEventLog() {
    return this._eventLog
  }

  _clearEventLog() {
    this._eventLog = []
  }

  disableClickRecording() {
    this._isRecordingClicks = false
  }

  enableClickRecording() {
    this._isRecordingClicks = true
  }

  static _getCoordinates(evt) {
    const eventsWithCoordinates = {
      mouseup: true,
      mousedown: true,
      mousemove: true,
      mouseover: true,
    }

    return eventsWithCoordinates[evt.type] ? { x: evt.clientX, y: evt.clientY } : null
  }
}
