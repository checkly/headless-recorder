import eventsToRecord from './events-to-record'
import elementsToBindTo from './elements-to-bind-to'
import finder from '@medv/finder'

class EventRecorder {
  start () {
    const elements = document.querySelectorAll(elementsToBindTo.join(','))

    addAllListeners(elements)

    chrome.runtime.onMessage.addListener((msg, sender, resp) => {
      if (msg.control && msg.control === 'get-current-url') {
        resp({ href: window.location.href })
      }

      if (msg.control && msg.control === 'get-viewport-size') {
        resp({ value: { width: window.innerWidth, height: window.innerHeight } })
      }
    })
    const msg = { control: 'event-recorder-started' }
    sendMessage(msg)
    console.debug('Puppeteer Recorder in-page EventRecorder started')
  }
}

function addAllListeners (elements) {
  for (let i = 0; i < elements.length; i++) {
    for (let j = 0; j < eventsToRecord.length; j++) {
      if (!elements[i].getAttribute('data-pptr-rec')) {
        elements[i].addEventListener(eventsToRecord[j], recordEvent, false)
        elements[i].setAttribute('data-pptr-rec', 'on')
      }
    }
  }
}

function recordEvent (e) {
  console.debug(e)
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
