<template functional>
  <div class="checkly-badge text-muted">
    powered by
    <a href="https://checklyhq.com" target="_blank">
      <img src="/images/text_racoon_logo.svg" alt="Checkly logo">
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
      width: 80px;
      vertical-align: middle;
    }
  }
</style>
