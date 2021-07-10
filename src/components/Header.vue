<template>
  <div class="flex justify-between items-center p-4 pb-0 mb-2">
    <h1 role="button" class="text-sm font-semibold text-gray-darkest dark:text-gray-lightest">
      Headless Recorder
    </h1>
    <div class="flex">
      <button @click="$emit('dark')" class="ml-4">
        <img src="@/assets/icons/moon.svg" alt="help" class="w-4" />
      </button>
      <button @click="$emit('help')" class="ml-2">
        <img src="@/assets/icons/question.svg" alt="help" class="w-4" />
      </button>
      <button @click="$emit('options')" class="ml-2">
        <img src="@/assets/icons/gear.svg" alt="settings" class="w-4" />
      </button>
    </div>
  </div>
</template>
