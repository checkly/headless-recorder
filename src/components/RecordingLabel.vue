<template>
  <div
    data-test-id="recording-badge"
    class="flex text-base justify-center items-center text-red font-bold"
    :class="{ 'text-yellow-500': text === 'Paused' }"
  >
    {{ text }}
  </div>
</template>

<script>
export default {
  name: 'RecordingLabel',
  props: {
    isPaused: { type: Boolean, default: false },
  },

  computed: {
    text() {
      return this.isPaused ? 'Paused' : 'Recording...'
    },
  },
}
</script>
