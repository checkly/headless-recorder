<template>
  <div class="flex px-4 py-3 justify-between items-center mt-3">
    <a href="https://checklyhq.com" target="_blank">
      <img src="/images/checkly-logo.svg" alt="Checkly logo" class="w-24" />
    </a>
    <span class="text-gray-darkish">Version {{ version }}</span>
  </div>
</template>

<script>
import { ref } from 'vue'
import { version } from '../../package.json'

export default {
  name: 'ChecklyBadge',

  setup() {
    return {
      version: ref(version),
    }
  },
}
</script>
