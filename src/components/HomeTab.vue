<template>
  <div
    class="bg-white flex flex-col justify-center items-center rounded-md h-100"
  >
    <h3 class="text-pink text-sm font-semibold mb-3">No recorded events yet</h3>
    <p class="text-gray text-xs mb-5 text-center w-44">
      Record browser events by clicking record button
    </p>
    <button
      @click="$emit('start')"
      class="font-semibold text-sm text-white bg-blue flex items-center rounded-sm p-2.5"
    >
      <img
        src="@/assets/icons/device-camera-video.svg"
        alt="video camera"
        class="mr-2"
      />
      Record Events
    </button>
  </div>
</template>
