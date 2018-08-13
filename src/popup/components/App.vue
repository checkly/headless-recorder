<template>
  <div id="puppeteer-recorder" class="recorder">
    <div class="header">
      Puppeteer recorder
      <div class="left">
        <div class="recording-badge" v-show="isRecording">
          <span class="red-dot"></span>
          recording
        </div>
        <a href="#" @click="openOptions" class="options-button">
          <img src="/images/settings.svg" alt="settings" width="18px">
        </a>
      </div>
    </div>
    <div class="main">
      <div class="tabs">
        <div class="tab record-tab" v-show="!showResultsTab">
          <div class="content">
            <div class="empty" v-show="!isRecording">
              <img src="/images/Desert.svg" alt="desert" width="78px">
              <h3>No recorded events yet</h3>
              <p class="text-muted">Click record to begin</p>
            </div>
            <div class="events" v-show="isRecording">
                <p class="text-muted text-center" v-show="liveEvents.length === 0">Waiting for events...</p>
              <ul class="event-list">
                <li v-for="(event, index) in liveEvents" class="event-list-item">
                  <div class="event-label">
                    {{index + 1}}.
                  </div>
                  <div class="event-description">
                    <div class="event-action">{{event.action}}</div>
                    <div class="event-props text-muted">{{event.selector || event.href }}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <button class="btn btn-sm" @click="toggleRecord" :class="isRecording ? 'btn-danger' : 'btn-primary'">
              {{recordButtonText}}
            </button>
            <a href="#" @click="showResultsTab = true" v-show="code">view code</a>
          </div>
        </div>
        <div class="tab results-tab" v-show="showResultsTab">
          <div class="content">
            <pre v-show="!code">
              <code>
                No code yet...
              </code>
            </pre>
            <pre v-highlightjs="code" v-show="code"><code class="javascript"></code></pre>
          </div>
          <div class="footer">
            <button class="btn btn-sm btn-primary" @click="restart" v-show="code">Restart</button>
            <a href="#" v-clipboard:copy='code' @click="setCopying" v-show="code">{{copyLinkText}}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import CodeGenerator from '../code-generator/CodeGenerator'
  import './github-gist.css'
  export default {
    name: 'App',
    data () {
      return {
        code: '',
        showResultsTab: false,
        liveEvents: [],
        recording: [],
        isRecording: false,
        isCopying: false,
        bus: null
      }
    },
    mounted () {
      this.loadState(() => {
        if (this.isRecording) {
          console.debug('opened in recording state, fetching recording events')
          chrome.storage.local.get(['recording', 'code'], ({ recording }) => {
            console.debug('loaded recording', recording)
            this.liveEvents = recording
          })
        }
      })
      this.bus = chrome.extension.connect({ name: 'recordControls' })
    },
    methods: {
      toggleRecord () {
        if (this.isRecording) {
          this.stop()
        } else {
          this.start()
        }
        this.isRecording = !this.isRecording
        this.storeState()
      },
      start () {
        console.debug('start recorder')
        this.code = ''
        this.bus.postMessage({ action: 'start' })
      },
      stop () {
        console.debug('stop recorder')
        this.bus.postMessage({ action: 'stop' })

        chrome.storage.local.get(['recording', 'codeOptions'], ({ recording, codeOptions }) => {
          console.debug('loaded recording', recording)
          this.recording = recording
          const codeGen = new CodeGenerator(codeOptions)
          this.code = codeGen.generate(this.recording)
          this.showResultsTab = true
          this.storeState()
        })
      },
      restart () {
        console.log('restart')
        this.bus.postMessage({ action: 'restart' })

        this.recording = this.liveEvents = []
        this.code = ''
        this.showResultsTab = false
        this.storeState()
      },
      openOptions () {
        if (chrome.runtime.openOptionsPage) {
          chrome.runtime.openOptionsPage()
        }
      },
      loadState (cb) {
        chrome.storage.local.get(['controls', 'code'], ({ controls, code }) => {
          console.debug('loaded controls', controls)
          if (controls) {
            this.isRecording = controls.isRecording
          }

          if (code) {
            this.code = code
          }
          cb()
        })
      },
      storeState () {
        chrome.storage.local.set({
          code: this.code,
          controls: {
            isRecording: this.isRecording
          }
        })
      },
      setCopying () {
        this.isCopying = true
        setTimeout(() => { this.isCopying = false }, 1500)
      }
    },
    computed: {
      recordButtonText () {
        return this.isRecording ? 'Stop' : 'Record'
      },
      copyLinkText () {
        return this.isCopying ? 'copied!' : 'copy to clipboard'
      }
    }
}
</script>

<style lang="scss" scoped>
  @import "../variables";

  .recorder {
    font-size: 14px;

    .header {
      background: $gray-lightest;
      height: 48px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 0 $spacer;
      font-weight: 500;

      .left {
        margin-left: auto;
        display: flex;
        justify-content: flex-start;
        align-items: center;

        .recording-badge {
          color: $brand-danger;
          .red-dot {
            height: 8px;
            width: 8px;
            background-color: $brand-danger;
            border-radius: 50%;
            display: inline-block;
            margin-right: .4rem;
            vertical-align: middle;
            position: relative;
          }
        }

        .options-button {
          margin-left: $spacer;
          img {
            vertical-align: middle;
          }
        }
      }
    }

    .record-tab {
      .content {
        min-height: 200px;
        .empty {
          padding: $spacer;
          text-align: center;
        }
      }
    }

    .events {
      max-height: 400px;
      overflow-y: auto;

      .event-list {
        list-style-type: none;
        padding: 0;
        margin: 0;

        .event-list-item {
          padding: 12px;
          font-size: 12px;
          border-top: 1px solid $gray-light;
          display: flex;
          flex: 1 1 auto;
          height: 32px;

          .event-label {
            vertical-align: top;
            margin-right: $spacer;
          }

          .event-description {
            margin-right: auto;
            display: inline-block;

            .event-action {
              font-weight: bold;
            }

            .event-props {
              white-space: pre;
            }
          }

        }
      }
    }

    .results-tab {
      .content {
        pre {
          padding: 0 $spacer;
          font-size: 12px;
        }
      }
    }

    .code {
      font-family: Consolas, Monaco, monospace;
      padding: $spacer;
    }

    .footer {
      background: $gray-lightest;
      height: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 $spacer;
      font-weight: 500;
      border-top: 1px solid $gray-light;
    }
  }
</style>
