<template>
  <div
    data-test-id="recording-badge"
    class="flex justify-center items-center text-red font-semibold"
    :class="{
      'text-yellow-500': text === 'Paused',
    }"
  >
    {{ text }}
  </div>
</template>

<script>
export default {
  props: {
    text: { type: String, default: '' },
  },
}
</script>
