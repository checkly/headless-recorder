<template>
  <div class="tab help-tab">
    <div class="content">
      <h4>Recording</h4>
      <ul>
        <li>To start recording hit <strong>Record</strong></li>
        <li>Hit <kbd>tab</kbd> after you finish typing in an <kbd>input</kbd> element.</li>
        <li>Click links, inputs and other elements.</li>
        <li>Wait for full page load on each navigation. The icon will switch from <img src="/images/icon_rec.png"> to
          <img src="/images/icon_wait.png">.</li>
        <li>Click <strong>Pause</strong> when you want to navigate without recording anything.
          Hit <strong>Resume</strong> to continue recording.</li>
      </ul>
      <h4>Controls</h4>
      <p>While recording, right click to show extra controls that trigger various functions like recording screenshots.
        <img src="/images/context_menu.png" alt="context menu" class="w-100">
      </p>
      <h4>Keyboard shortcuts</h4>
      <ul>
        <li>Take screenshot: Ctrl+Shift+A</li>
        <li>Take clipped screenshot: Ctrl+Shift+M</li>
      </ul>
      <p>For more help and examples, <a href="https://checklyhq.com/puppeteer-recorder" target="_blank">go to the help docs</a></p>
      <h4>Replaying</h4>
      <p>Install <a href="https://github.com/GoogleChrome/puppeteer">Puppeteer</a> on your machine. Copy and paste the code
      into a file and run as a standard node program</p>
      <pre>
npm install puppeteer
node my-script.js</pre>
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
  @import "~styles/_utils.scss";


  .help-tab {
    .content {
      padding: $spacer;
      text-align: left;

      ul {
        padding-left: 1rem;
      }

      pre {
        background: #272822;
        color: white;
        font-family: monospace;
        padding: 1rem;
        border-radius: 4px;
      }
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
