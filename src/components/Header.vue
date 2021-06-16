<template>
  <div class="flex justify-between items-center p-4 pb-0 mb-2">
    <h1
      @click="$emit('home')"
      role="button"
      class="text-sm font-semibold text-gray-darkest"
    >
      Headless Recorder
    </h1>
    <div class="flex">
      <button class="ml-4">
        <img src="@/assets/icons/moon.svg" alt="help" class="w-4" />
      </button>
      <button @click="$emit('question')" class="ml-2">
        <img src="@/assets/icons/question.svg" alt="help" class="w-4" />
      </button>
      <button @click="$emit('options')" class="ml-2">
        <img src="@/assets/icons/gear.svg" alt="settings" class="w-4" />
      </button>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style></style>
