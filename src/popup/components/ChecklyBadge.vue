<template functional>
  <div class="checkly-badge text-muted">
    powered by
    <a href="https://playwright.dev/" target="_blank">
      <img src="/images/mslogo.jpg" alt="Microsoft logo">
    </a>
    &amp
    <a href="https://checklyhq.com" target="_blank">
      <img width="30px" src="/images/text_racoon_logo.svg" alt="Checkly logo">
    </a>
  </div>
</template>

<script>
  export default {
    name: 'ChecklyBadge'
  }
</script>

<style lang="scss" scoped>
  .checkly-badge {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-weight: normal;
    img {
      margin-left: 8px;
      width: 62px;
      vertical-align: middle;
    }
  }
</style>
