<template>
  <div class="options">
    <div class="container">
      <div class="header">
        Puppeteer Recorder Options
        <small class="saving-badge text-muted" v-show="saving">
          Saving...
        </small>
      </div>
      <div class="content" v-if="!loading">
        <div class="settings-block">
          <h4 class="settings-block-title">
            Code Generator settings
          </h4>
          <div class="settings-block-main">
            <label>
              <input id="options-code-wrapAsync" type="checkbox" v-model="options.code.wrapAsync" @change="save">
              wrap code in async function
            </label>
          </div>
        </div>
      </div>
      <div class="footer">
        sponsored by
        <a href="https://checklyhq.com" target="_blank">
          <img src="/images/text_racoon_logo.svg" alt="">
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  const defaults = {
    code: {
      wrapAsync: true
    }
  }

  export default {
    name: 'App',
    data () {
      return {
        loading: true,
        saving: false,
        options: defaults
      }
    },
    mounted () {
      this.load()
    },
    methods: {
      save () {
        this.saving = true
        this.$chrome.storage.local.set({ options: this.options }, () => {
          console.debug('saved options')
          setTimeout(() => {
            this.saving = false
          }, 500)
        })
      },
      load () {
        this.$chrome.storage.local.get('options', ({ options }) => {
          if (options) {
            console.debug('loaded options', JSON.stringify(options))
            this.options = options
          }
          this.loading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "~styles/_variables.scss";
  @import "~styles/_mixins.scss";

  .options {

    height: 100%;
    min-height: 580px;
    background: $gray-lighter;
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: auto;
    position: fixed;
    left: 0;
    top: 0;

    .container {
      padding: 0 2 * $spacer;
      width: 550px;
      margin: 0 auto;

      .content {
        background: white;
        padding: 2 * $spacer;
        border-radius: 4px;
        min-height: 500px;
      }

      .footer {
        @include footer();
        background: $gray-lighter;
        font-weight: normal;
        justify-content: center;
        img {
          margin-left: 8px;
          width: 80px;
          vertical-align: middle;
        }
      }

      .header {
        @include header();
        background: $gray-lighter;
        justify-content: space-between;
      }

      .settings-block {
        .settings-block-title {
          margin: 0;
          padding-bottom: $spacer;
          border-bottom: 1px solid $gray-light;
        }
        .settings-block-main {
          padding: $spacer 0;
          margin-bottom: $spacer;
        }
      }
    }
  }
</style>
