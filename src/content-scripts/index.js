import eventsToRecord from '../code-generator/dom-events-to-record'
import elementsToBindTo from '../code-generator/elements-to-bind-to'
import finder from '@medv/finder'
import debounce from 'lodash.debounce'

class EventRecorder {
  start () {
    const elements = document.querySelectorAll(elementsToBindTo.join(','))
    const events = Object.values(eventsToRecord)
    addAllListeners(elements, events)

    if (!window.document.pptRecorderAddedControlListeners) {
      chrome.runtime.onMessage.addListener(getCurrentUrl)
      chrome.runtime.onMessage.addListener(getViewPortSize)
      window.document.pptRecorderAddedControlListeners = true
    }

    const msg = { control: 'event-recorder-started' }
    sendMessage(msg)
    console.debug('Puppeteer Recorder in-page EventRecorder started')
  }
}

function getCurrentUrl (msg) {
  if (msg.control && msg.control === 'get-current-url') {
    console.debug('sending current url:', window.location.href)
    sendMessage({ control: msg.control, href: window.location.href })
  }
}

function getViewPortSize (msg) {
  if (msg.control && msg.control === 'get-viewport-size') {
    console.debug('sending current viewport size')
    sendMessage({ control: msg.control, coordinates: { width: window.innerWidth, height: window.innerHeight } })
  }
}

function addAllListeners (elements, events) {
  const debouncedRecordEvent = debounce(recordEvent, 10)
  for (let element of elements) {
    if (element.getAttribute('data-pptr-rec') !== 'on') {
      for (let event of events) {
        element.addEventListener(event, debouncedRecordEvent, false)
      }
    }
    element.setAttribute('data-pptr-rec', 'on')
  }
}

function recordEvent (e) {
  const msg = {
    selector: finder(e.target, { seedMinLength: 5, optimizedMinLength: 10 }),
    value: e.target.value,
    action: e.type,
    keyCode: e.keyCode ? e.keyCode : null,
    href: e.target.href ? e.target.href : null,
    coordinates: getCoordinates(e)
  }
  sendMessage(msg)
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

function sendMessage (msg) {
  console.debug('sending message', msg)
  try {
    chrome.runtime.sendMessage(msg)
  } catch (err) {
    console.debug('caught error', err)
  }
}

window.eventRecorder = new EventRecorder()
window.eventRecorder.start()
