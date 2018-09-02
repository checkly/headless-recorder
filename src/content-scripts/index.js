import eventsToRecord from '../code-generator/dom-events-to-record'
import elementsToBindTo from '../code-generator/elements-to-bind-to'
import finder from '@medv/finder'
import debounce from 'lodash.debounce'

class EventRecorder {
  constructor () {
    this.eventLog = []
  }

  start () {
    const elements = document.querySelectorAll(elementsToBindTo.join(','))
    const events = Object.values(eventsToRecord)
    this.addAllListeners(elements, events)

    if (!window.document.pptRecorderAddedControlListeners && chrome.runtime && chrome.runtime.onMessage) {
      const boundedGetCurrentUrl = this.getCurrentUrl.bind(this)
      const boundedGetViewPortSize = this.getViewPortSize.bind(this)
      chrome.runtime.onMessage.addListener(boundedGetCurrentUrl)
      chrome.runtime.onMessage.addListener(boundedGetViewPortSize)
      window.document.pptRecorderAddedControlListeners = true
    }

    const msg = { control: 'event-recorder-started' }
    this.sendMessage(msg)
    console.debug('Puppeteer Recorder in-page EventRecorder started')
  }

  sendMessage (msg) {
    console.debug('sending message', msg)
    try {
      // poor man's way of detecting whether this script was injected by an actual extension, or is loaded for
      // testing purposes
      if (chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.sendMessage(msg)
      } else {
        this.eventLog.push(msg)
      }
    } catch (err) {
      console.debug('caught error', err)
    }
  }

  getCurrentUrl (msg) {
    if (msg.control && msg.control === 'get-current-url') {
      console.debug('sending current url:', window.location.href)
      this.sendMessage({ control: msg.control, href: window.location.href })
    }
  }

  getViewPortSize (msg) {
    if (msg.control && msg.control === 'get-viewport-size') {
      console.debug('sending current viewport size')
      this.sendMessage({ control: msg.control, coordinates: { width: window.innerWidth, height: window.innerHeight } })
    }
  }

  recordEvent (e) {
    const msg = {
      selector: finder(e.target, { seedMinLength: 5, optimizedMinLength: 10 }),
      value: e.target.value,
      action: e.type,
      keyCode: e.keyCode ? e.keyCode : null,
      href: e.target.href ? e.target.href : null,
      coordinates: getCoordinates(e)
    }
    this.sendMessage(msg)
  }

  addAllListeners (elements, events) {
    const boundedRecordEvent = this.recordEvent.bind(this)
    const debouncedRecordEvent = debounce(boundedRecordEvent, 10)
    for (let element of elements) {
      if (element.getAttribute('data-pptr-rec') !== 'on') {
        for (let event of events) {
          element.addEventListener(event, debouncedRecordEvent, false)
        }
      }
      element.setAttribute('data-pptr-rec', 'on')
    }
  }

  getEventLog () {
    return this.eventLog
  }
}

function getCoordinates (evt) {
  const eventsWithCoordinates = {
    mouseup: true,
    mousedown: true,
    mousemove: true,
    mouseover: true
  }
  return eventsWithCoordinates[evt.type] ? { x: evt.clientX, y: evt.clientY } : null
}

window.eventRecorder = new EventRecorder()
window.eventRecorder.start()
