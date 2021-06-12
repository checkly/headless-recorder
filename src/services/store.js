// import { reactive } from 'vue'

const STORE_PROPERTIES = [
  'controls',
  'code',
  'options',
  'codeForPlaywright',
  'recording',
  'clear',
  'pause',
]

const initalState = {
  controls: {
    isRecording: false,
    isPaused: false,
  },
  code: '',
  codeForPlaywright: '',
}

function isStoreValid() {
  return true
}

function save(store) {
  if (!isStoreValid()) {
    throw new Error('Invalid store schema')
  }
  return chrome.storage.local.set(store)
}

const cleanUp = () => chrome.storage.local.set(initalState)

const load = properties =>
  new Promise(resolve =>
    chrome.storage.local.get(properties || STORE_PROPERTIES, store => resolve(store))
  )

const remove = property =>
  new Promise(resolve => chrome.storage.local.remove(property, () => resolve))
const set = property => new Promise(resolve => chrome.storage.local.set(property, () => resolve))

export default {
  remove,
  set,
  cleanUp,
  load,
  save,
}
