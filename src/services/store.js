import { ref, watchEffect } from 'vue'

const props = {
  CONTROLS: 'controls',
  CODE: 'code',
  OPTIONS: 'options',
  CODE_P: 'codeForPlaywright',
  RECORDING: 'recording',
}

export default class Store {
  constructor(context = '') {
    // TODO: Load values from local storage

    this.controls = ref({
      isRecording: false,
      isPaused: false,
    })

    this.isRecording = ref(false)
    this.isPaused = ref(true)

    this.recording = ref([])

    this.options = ref({})
    this.context = context
  }

  get(props) {
    return Promise(resolve => chrome.storage.local.get(props, store => resolve(store)))
  }

  save(store) {
    return new Promise(resolve => chrome.storage.local.set(store, res => resolve(res)))
  }

  getAll() {
    return this.get(Object.keys(props))
  }

  sync() {
    watchEffect(() => {
      this.save(this.isRecording)
    })

    chrome.storage.onChanged.addListener(changes => {
      Object.keys(changes).forEach(key => {
        if (this[key] !== undefined && this[key] !== null) {
          this[key].value = changes[key].newValue
        }
      })
    })
  }

  onChange(cb) {
    chrome.storage.onChanged.addListener(changes => {
      cb.call(changes)
    })
  }

  useStore() {
    return {
      controls: this.controls,
      options: this.options,
    }
  }
}
