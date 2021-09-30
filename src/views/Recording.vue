<template>
  <section class="flex flex-col items-center rounded-md pt-8 h-full">
    <RecordingLabel class="w-1/3" :is-paused="isPaused" :v-show="isRecording" />
    <p class="text-gray-dark text-sm text-center w-72 dark:text-gray-light">
      Headless recorder currently recording your browser events.
    </p>
    <RoundButton big @click="$emit('stop')" class="p-12 mt-10">
      <div class="bg-gray-darkest rounded h-16 w-16 dark:bg-white"></div>
    </RoundButton>

    <div class="flex mt-13 mb-8 items-center justify-center">
      <div class="flex flex-col items-center justify-center mr-10">
        <RoundButton
          medium
          @click="$emit('pause')"
          class="flex flex-col items-center justify-center"
        >
          <img
            :src="`/icons/${darkMode ? 'dark' : 'light'}/play.svg`"
            v-show="isPaused"
            class="w-10 h-10"
            alt="resume recording"
          />
          <img
            :src="`/icons/${darkMode ? 'dark' : 'light'}/pause.svg`"
            v-show="!isPaused"
            class="w-10 h-10"
            alt="pause recording"
          />
        </RoundButton>
        <span class="mt-2 text-sm font-semibold text-gray-new">{{
          isPaused ? 'RESUME' : 'PAUSE'
        }}</span>
      </div>
      <div class="flex flex-col items-center justify-center">
        <RoundButton
          medium
          @click="$emit('restart')"
          class="flex flex-col items-center justify-center"
        >
          <img
            :src="`/icons/${darkMode ? 'dark' : 'light'}/sync.svg`"
            class="w-10 h-10"
            alt="restart recording"
          />
        </RoundButton>
        <span class="mt-2 text-sm font-semibold text-gray-new">RESTART</span>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import RoundButton from '@/components/RoundButton.vue'
import RecordingLabel from '@/components/RecordingLabel.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: { RoundButton, RecordingLabel },

  props: {
    darkMode: Boolean,
    isRecording: Boolean,
    isPaused: Boolean,
  },
  emits: ['start', 'pause', 'restart', 'stop'],
})
</script>
