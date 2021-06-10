<template>
  <div class="options">
    <div class="container">
      <div class="header">
        Headless Recorder Options
        <small class="saving-badge text-muted" v-show="saving">
          Saving...
        </small>
      </div>
      <div class="content" v-if="!loading">
        <div class="settings-block">
          <h4 class="settings-block-title">
            Code Recorder settings
          </h4>
          <div class="settings-block-main">
            <div class="settings-group">
              <label class="settings-label">custom data attribute</label>
              <input
                id="options-code-dataAttribute"
                type="text"
                v-model.trim="options.code.dataAttribute"
                @change="save"
                placeholder="your custom data-* attribute"
              />
              <small
                >Define an attribute that we'll attempt to use when selecting
                the elements, i.e "data-custom". This is handy when React or Vue
                based apps generate random class names.</small
              >
              <small class="settings-warning"
                >⚠️ When data attribute is set, it will take precedence from
                over other any selector (even ID)</small
              >
            </div>
            <div class="settings-group">
              <label class="settings-label">set key code</label>
              <div class="settings-block">
                <button
                  class="btn btn-sm btn-primary"
                  @click="listenForKeyCodePress"
                >
                  {{
                    recordingKeyCodePress
                      ? "Capturing"
                      : "Click to capture key code"
                  }}
                </button>
                <input
                  id="options-code-keyCode"
                  readonly
                  disabled
                  type="number"
                  v-model.number="options.code.keyCode"
                  placeholder="Key Code for input fields (ex. 9 = Tab)"
                />
              </div>
              <small
                >What key will be used for capturing input changes. The value
                here is the key code. This will not handle multiple keys.</small
              >
            </div>
          </div>
        </div>
        <div class="settings-block">
          <h4 class="settings-block-title">
            Code Generator settings
          </h4>
          <div class="settings-block-main">
            <div class="settings-group">
              <label>
                <input
                  id="options-code-wrapAsync"
                  type="checkbox"
                  v-model="options.code.wrapAsync"
                  @change="save"
                />
                Wrap code in async function
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input
                  id="options-code-headless"
                  type="checkbox"
                  v-model="options.code.headless"
                  @change="save"
                />
                Set <code>headless</code> in puppeteer launch options
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input
                  id="options-code-waitForNavigation"
                  type="checkbox"
                  v-model="options.code.waitForNavigation"
                  @change="save"
                />
                Add <code>waitForNavigation</code> lines on navigation
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input
                  id="options-code-waitForSelectorOnClick"
                  type="checkbox"
                  v-model="options.code.waitForSelectorOnClick"
                  @change="save"
                />
                Add <code>waitForSelector</code> lines before every
                <code>page.click()</code>
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input
                  id="options-code-blankLinesBetweenBlocks"
                  type="checkbox"
                  v-model="options.code.blankLinesBetweenBlocks"
                  @change="save"
                />
                Add blank lines between code blocks
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input
                  id="options-code-showPlaywrightFirst"
                  type="checkbox"
                  v-model="options.code.showPlaywrightFirst"
                  @change="save"
                />
                Show Playwright tab first
              </label>
            </div>
          </div>
        </div>
        <div class="settings-block">
          <h4 class="settings-block-title">
            Extension settings
          </h4>
          <div class="settings-block-main">
            <div class="settings-group">
              <label>
                <input
                  id="options-telemetry"
                  type="checkbox"
                  v-model="options.extension.telemetry"
                  @change="save"
                />
                Allow recording of usage telemetry
              </label>
              <br />
              <small
                >We only record clicks for basic product development, no website
                content or input data. Data is never, ever shared with 3rd
                parties.</small
              >
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        sponsored by
        <a href="https://checklyhq.com" target="_blank">
          <img src="@/assets/images/text_racoon_logo.svg" alt="" />
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { defaults as code } from "@/services/CodeGenerator";

const defaults = {
  code,
  extension: {
    telemetry: true
  }
};

export default {
  name: "App",
  data() {
    return {
      loading: true,
      saving: false,
      options: defaults,
      recordingKeyCodePress: false
    };
  },
  mounted() {
    this.load();
  },
  methods: {
    save() {
      this.saving = true;
      chrome.storage.local.set({ options: this.options }, () => {
        console.debug("saved options");
        setTimeout(() => {
          this.saving = false;
        }, 500);
      });
    },
    load() {
      chrome.storage.local.get("options", ({ options }) => {
        if (options) {
          console.debug("loaded options", JSON.stringify(options));
          this.options = options;
        }
        this.loading = false;
      });
    },
    listenForKeyCodePress() {
      this.recordingKeyCodePress = true;
      const keyDownFunction = e => {
        this.recordingKeyCodePress = false;
        this.updateKeyCodeWithNumber(e);
        window.removeEventListener("keydown", keyDownFunction, false);
        e.preventDefault();
      };
      window.addEventListener("keydown", keyDownFunction, false);
    },
    updateKeyCodeWithNumber(evt) {
      this.options.code.keyCode = parseInt(evt.keyCode, 10);
      this.save();
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/_variables.scss";
@import "../assets/styles/_mixins.scss";

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
      .settings-label {
        display: block;
        text-transform: uppercase;
        font-size: 0.75rem;
        font-weight: 500;
        margin-bottom: $spacer;
      }

      .settings-warning {
        display: block;
        font-size: 0.75rem;
        font-weight: 500;
        color: $pink;
        margin: $spacer 0;
      }

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
      input[type="text"],
      input[type="number"] {
        margin-bottom: 10px;
        width: 100%;
        border: 1px solid $gray-light;
        padding-left: 15px;
        height: 38px;
        font-size: 14px;
        border-radius: 10px;
        -webkit-box-sizing: border-box;
      }
      input[type="number"] {
        width: 50px;
      }
    }
  }
}
</style>
