<template>
  <div class="flex justify-between items-center py-4 px-2">
    <div class="flex w-1/3">
      <RoundButton @click="$emit('stop')" class="mr-1">
        <img :src="`/icons/${darkMode ? 'dark' : 'light'}/stop.svg`" />
      </RoundButton>
      <RoundButton @click="$emit('pause')" v-show="isRecording">
        <img :src="`/icons/${darkMode ? 'dark' : 'light'}/play.svg`" v-show="isPaused" />
        <img :src="`/icons/${darkMode ? 'dark' : 'light'}/pause.svg`" v-show="!isPaused" />
      </RoundButton>
    </div>
    <RecordingLabel class="w-1/3" :is-paused="isPaused" :v-show="isRecording" />
  </div>
</template>

<script>
import RoundButton from '@/components/RoundButton.vue'
import RecordingLabel from '@/components/RecordingLabel.vue'

export default {
  name: 'ControlBar',
  components: { RoundButton, RecordingLabel },

  props: {
    darkMode: { type: Boolean, default: false },
    isRecording: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },
  },
}
</script>

<style></style>
