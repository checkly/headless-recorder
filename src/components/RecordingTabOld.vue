<template>
  <div
    class="bg-white flex flex-col items-center overflow-auto break-all whitespace-pre-wrap h-100 dark:bg-black-light"
    :class="{ 'justify-center': !liveEvents.length }"
  >
    <div
      v-if="!liveEvents.length"
      class="text-sm text-gray flex flex-col justify-center items-center animate-pulse h-100 dark:text-gray-light"
    >
      Waiting for events...
    </div>
    <ul v-else class="flex flex-col items-start p-2 w-full h-100">
      <li
        v-for="(event, index) in liveEvents"
        :key="index"
        class="border-b border-gray-lighter mb-4 w-full p-2"
      >
        <div class="text-sm mb-1">
          <span class="text-gray mr-1 dark:text-gray-light">{{ index + 1 }}.</span>
          <span class="text-gray-dark font-semibold uppercase dark:text-gray-light">{{
            event.action
          }}</span>
        </div>
        <span class="text-xs text-gray dark:text-gray-lightest">
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
