<template>
  <button
    class="p-2 bg-white rounded-full border-gray-light border-solid border-4 dark:bg-black-shady dark:border-gray-dark"
    :class="{ 'btn-small': small }"
  >
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    small: { type: Boolean, default: true },
  },
}
</script>

<style scoped>
.btn-small {
  border-radius: 50%;
  height: 36px;
  width: 36px;
}
</style>
