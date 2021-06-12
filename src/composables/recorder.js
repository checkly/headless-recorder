import { ref, readonly } from 'vue'

const isRecording = ref(false)
const isPaused = ref(false)

export default function useRecorder(bus) {
  function start() {
    isRecording.value = true
    bus.postMessage({ action: 'START' })
  }

  function stop() {
    isRecording.value = true
    bus.postMessage({ action: 'STOP' })
  }

  return {
    start,
    stop,
    isRecording: readonly(isRecording),
    isPaused: readonly(isPaused),
  }
}
