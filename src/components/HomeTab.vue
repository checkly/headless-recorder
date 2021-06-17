<template>
  <div class="flex flex-col items-center rounded-md pt-10 h-100">
    <h3 class="text-pink text-sm font-semibold mb-3 dark:text-gray-lightest">
      No recorded events yet
    </h3>
    <p class="text-gray text-xs mb-5 text-center w-44">
      Record browser events by clicking record button
    </p>
    <RoundButton :small="false" @click="$emit('start')" class="p-10 mt-12">
      <svg
        width="86"
        height="86"
        viewBox="0 0 86 86"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="43" cy="43" r="43" fill="#FF4949" />
      </svg>
    </RoundButton>
  </div>
</template>

<script>
import RoundButton from '@/components/RoundButton'

export default {
  components: { RoundButton },
}
</script>
