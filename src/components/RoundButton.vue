<template>
  <button
    class="p-2 bg-white rounded-full border-gray-light border-solid border-4 hover:bg-gray-lightest dark:hover:bg-gray-hover dark:bg-black-shady dark:border-gray-dark"
    :class="{ 'btn-small': small, 'btn-medium': medium }"
  >
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    small: { type: Boolean, default: false },
    medium: { type: Boolean, default: false },
    big: { type: Boolean, default: false },
  },
}
</script>

<style scoped>
.btn-small {
  border-radius: 50%;
  height: 36px;
  width: 36px;
}

.btn-medium {
  height: 72px;
  width: 72px;
}
</style>
