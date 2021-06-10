<template>
  <div
    class="flex flex-col items-center bg-white rounded-md h-100 overflow-auto break-all whitespace-pre-wrap"
    :class="{ 'justify-center': !liveEvents.length }"
  >
    <p class="text-sm text-gray animate-pulse" v-show="!liveEvents.length">
      Waiting for events...
    </p>
    <ul class="flex flex-col items-start p-2 w-full">
      <li
        v-for="(event, index) in liveEvents"
        :key="index"
        class="border-b border-gray-lighter mb-4 w-full p-2"
      >
        <div class="text-sm mb-1">
          <span class="text-gray mr-1">{{ index + 1 }}.</span>
          <span class="text-gray-dark font-semibold uppercase">{{
            event.action
          }}</span>
        </div>
        <span class="text-xs text-gray">
          {{ parseEventValue(event) }}
        </span>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'RecordingTab',

  props: {
    isRecording: { type: Boolean, default: false },
    liveEvents: {
      type: Array,
      default: () => {
        return []
      },
    },
  },

  methods: {
    parseEventValue(event) {
      if (!event) {
        return ''
      }

      if (event.selector) {
        return event.selector
      }

      const action = event?.action.toLowerCase()

      if (action === 'viewport') {
        return `width: ${event.value.width} - height: ${event.value.height}`
      }
      if (action === 'goto') {
        return event.href
      }

      return ''
    },
  },
}
</script>
