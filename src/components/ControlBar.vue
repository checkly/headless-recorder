<template>
  <div class="flex justify-between items-center py-4 px-2">
    <div class="flex w-1/3">
      <RoundButton @click="$emit('stop')" class="mr-1">
        <img src="@/assets/icons/light/stop.svg" />
      </RoundButton>
      <RoundButton @click="$emit('pause')" v-show="isRecording">
        <img src="@/assets/icons/light/play.svg" v-show="isPaused" />
        <img src="@/assets/icons/light/pause.svg" v-show="!isPaused" />
      </RoundButton>
    </div>
    <RecordingLabel class="w-1/3" :is-paused="isPaused" :v-show="isRecording" />
    <div class="w-1/3 flex justify-end">
      <RoundButton @click="$emit('restart')" v-show="isRecording">
        <img src="@/assets/icons/light/restart.svg" />
      </RoundButton>
    </div>
  </div>
</template>

<script>
import RoundButton from '@/components/RoundButton.vue'
import RecordingLabel from '@/components/RecordingLabel.vue'

export default {
  name: 'ControlBar',
  components: { RoundButton, RecordingLabel },

  props: {
    isRecording: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },
  },
}
</script>

<style></style>
