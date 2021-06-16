<template>
  <div>
    <h1>{{ controls }}</h1>

    <button class="bg-blue" @click="start">Start</button>
    <button class="bg-red" @click="stop">Stop</button>
  </div>
</template>

<script>
import Store from '@/services/store'
import { uiActions } from '@/services/constants'

export default {
  name: 'App',

  setup() {
    const store = new Store('popup')
    const { controls } = store.useStore()
    store.sync()

    const bus = chrome.extension.connect({ name: 'recordControls' })

    function start() {
      controls.value.isRecording = true
      bus.postMessage({ action: uiActions.START })
    }

    function stop() {
      controls.value.isRecording = false
      bus.postMessage({ action: uiActions.STOP })
    }

    return { controls, start, stop }
  },
}
</script>

<style>
html {
  width: 360px;
  height: 535px;
}
</style>
