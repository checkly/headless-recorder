<template>
  <div class="flex items-center mb-3">
    <button
      type="button"
      :class="[
        modelValue ? 'bg-blue' : 'bg-gray',
        'relative inline-flex flex-shrink-0 h-4 w-8 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue',
      ]"
      role="switch"
      aria-checked="false"
      @click="toggle"
    >
      <span
        aria-hidden="true"
        :class="[
          modelValue ? 'translate-x-4' : 'translate-x-0',
          'm-px pointer-events-none inline-block h-2.5 w-2.5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
        ]"
      ></span>
    </button>
    <span class="ml-4">
      <span class="text-sm text-gray-dark dark:text-gray-light">
        <slot />
      </span>
    </span>
  </div>
</template>

<script>
export default {
  name: 'Toggle',
  props: { modelValue: { type: Boolean, default: true } },

  setup(props, context) {
    function toggle() {
      context.emit('update:modelValue', !props.modelValue)
    }

    return { toggle }
  },
}
</script>
