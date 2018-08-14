<template>
  <div class="tab help-tab">
    <div class="content">
      <h3>Usage</h3>
      <ul>
        <li>To start recording hit Record.</li>
        <li>Hit <kbd>tab</kbd> after you finish typing in an <kbd>input</kbd> element.</li>
        <li>Click links, inputs and other elements.</li>
        <li>Wait for full page load on each navigation. The icon will switch from <img src="/images/icon_rec.png"> to
          <img src="/images/icon_wait.png">.</li>
        <li>Click Pause when you want to navigate without recording anything. Hit Resume to continue recording.</li>
      </ul>
    </div>
    <div class="help-footer text-muted">
      sponsored by
      <a href="https://checklyhq.com" target="_blank">
        <img src="/images/text_racoon_logo.svg" alt="">
      </a>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'HelpTab'
  }
</script>
<style lang="scss" scoped>
  @import "~styles/_variables.scss";
  @import "~styles/_mixins.scss";

  .help-tab {
    .content {
      padding: $spacer;
      text-align: left;
    }

    .help-footer {
      @include footer();
      font-weight: normal;
      justify-content: flex-end;
      img {
        margin-left: 8px;
        width: 80px;
        vertical-align: middle;
      }
    }
  }
</style>
