<template>
  <div class="flex justify-between items-center">
    <a href="https://checklyhq.com" target="_blank">
      <img
        src="@/assets/images/text_racoon_logo.svg"
        alt="Checkly logo"
        class="w-24"
      />
    </a>
    <span>Version {{ version }}</span>
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
