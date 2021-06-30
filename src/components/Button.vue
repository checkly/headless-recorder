<template>
  <button
    class="font-semibold text-xs text-gray-darkest inline-flex justify-center items-center rounded-sm p-2"
    :class="{
      'text-white': dark,
      'bg-gray-dark hover:bg-gray-darkest': dark,
      'text-gray-darkest': !dark,
      'bg-blue hover:bg-blue-dark': !dark,
    }"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'Button',

  props: {
    dark: { type: Boolean, default: false },
  },
}
</script>
