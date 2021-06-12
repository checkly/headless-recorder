<template>
  <h1>{{ isRecording }}</h1>
  <h1>{{ isPaused }}</h1>
  <button @click="start">Record</button>
  <button @click="stop">Stop</button>
</template>

<script>
import useRecorder from '@/composables/recorder'

export default {
  setup() {
    const bus = chrome.extension.connect({ name: 'recordControls' })
    const { isRecording, isPaused, start, stop } = useRecorder(bus)

    return { isRecording, isPaused, start, stop }
  },
}
</script>

<style>
html {
  width: 360px;
  height: 535px;
}
</style>
