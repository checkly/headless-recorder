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
            <div class="settings-group">
              <label>
                <input id="options-code-wrapAsync" type="checkbox" v-model="options.code.wrapAsync" @change="save">
                wrap code in async function
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input id="options-code-headless" type="checkbox" v-model="options.code.headless" @change="save">
                set <code>headless</code> in puppeteer launch options
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input id="options-code-waitForNavigation" type="checkbox" v-model="options.code.waitForNavigation" @change="save">
                add <code>waitForNavigation</code> lines on navigation
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input id="options-code-waitForSelectorOnClick" type="checkbox" v-model="options.code.waitForSelectorOnClick" @change="save">
                add <code>waitForSelector</code> lines before every <code>page.click()</code>
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input id="options-code-waitTillVisible" type="checkbox" v-model="options.code.waitTillVisible" @change="save">
                 <code>waitForSelector</code> will also wait till the element is considered visible
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input id="options-code-blankLinesBetweenBlocks" type="checkbox" v-model="options.code.blankLinesBetweenBlocks" @change="save">
                add blank lines between code blocks
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input id="options-code-wait" type="textbox" v-model="options.code.wait" @change="save">
                the timeout value for <code>page.waitFor(timeout)</code>
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input id="options-code-typingTerminator" type="textbox" v-model="options.code.typingTerminator" @change="save">
                the keycode that indicates that the user is done typing and emit the <code>type()</code> instruction
              </label>
            </div>
            <div class="settings-group">
              <label>
                <textarea id="options-code-cookies" v-model="options.code.cookies" @change="save"></textarea>
                a json value that defines the cookies to add to the page.
              </label>
            </div>
            <div class="settings-group">
              <label>
                <textarea id="options-code-localStorage" v-model="options.code.localStorage" @change="save"></textarea>
                a json value that defines the local storage values to add to the page.
              </label>
            </div>
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
  import { defaults as code } from '../../code-generator/CodeGenerator'

  const defaults = {
    code
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

          .settings-group {
            margin-bottom: $spacer;
            display: block;
          }
        }
      }
    }
  }
</style>
