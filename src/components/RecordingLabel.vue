<template>
  <div
    data-test-id="recording-badge"
    class="flex text-2xl justify-center items-center text-red font-semibold"
    :class="{ 'text-yellow': text === 'Paused', 'animate-pulse': text !== 'Paused' }"
  >
    {{ isPaused ? 'Paused' : 'Recording…' }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RecordingLabel',

  props: {
    isPaused: Boolean,
  },
})
</script>
