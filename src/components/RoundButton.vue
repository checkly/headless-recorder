<template>
  <button
    class="p-2 bg-white rounded-full border-gray-light border-solid border-4"
  >
    <slot />
  </button>
</template>

<style scoped>
button {
  justify-content: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 44px;
  min-width: 44px;
}
</style>
