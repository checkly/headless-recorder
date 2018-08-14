<template>
  <div id="puppeteer-recorder" class="recorder">
    <div class="header">
      Puppeteer recorder
      <div class="left">
        <div class="recording-badge" v-show="isRecording">
          <span class="red-dot"></span>
          {{recordingBadgeText}}
        </div>
        <a href="#" @click="openOptions" class="options-button">
          <img src="/images/settings.svg" alt="settings" width="18px">
        </a>
      </div>
    </div>
    <div class="main">
      <div class="tabs">
        <RecordingTab :code="code" :is-recording="isRecording" :live-events="liveEvents" v-show="!showResultsTab"/>
        <div class="recording-footer" v-show="!showResultsTab">
          <button class="btn btn-sm" @click="toggleRecord" :class="isRecording ? 'btn-danger' : 'btn-primary'">
            {{recordButtonText}}
          </button>
          <button class="btn btn-sm btn-primary btn-outline-primary" @click="togglePause" v-show="isRecording">
            {{pauseButtonText}}
          </button>
          <a href="#" @click="showResultsTab = true" v-show="code">view code</a>
        </div>
        <ResultsTab :code="code" :copy-link-text="copyLinkText" :restart="restart" :set-copying="setCopying" v-show="showResultsTab"/>
        <div class="results-footer" v-show="showResultsTab">
          <button class="btn btn-sm btn-primary" @click="restart" v-show="code">Restart</button>
          <a href="#" v-clipboard:copy='code' @click="setCopying" v-show="code">{{copyLinkText}}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import CodeGenerator from '../code-generator/CodeGenerator'
  import RecordingTab from "./RecordingTab.vue"
  import ResultsTab from "./ResultsTab.vue";

  export default {
    name: 'App',
    components: {ResultsTab, RecordingTab},
    data () {
      return {
        code: '',
        showResultsTab: false,
        liveEvents: [],
        recording: [],
        isRecording: false,
        isPaused: false,
        isCopying: false,
        bus: null
      }
    },
    mounted () {
      this.loadState(() => {
        if (this.isRecording) {
          console.debug('opened in recording state, fetching recording events')
          this.$chrome.storage.local.get(['recording', 'code'], ({ recording }) => {
            console.debug('loaded recording', recording)
            this.liveEvents = recording
          })
        }
      })
      this.bus = this.$chrome.extension.connect({ name: 'recordControls' })
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
      togglePause () {
        if (this.isPaused) {
          this.bus.postMessage({ action: 'unpause' })
          this.isPaused = false
        } else {
          this.bus.postMessage({ action: 'pause' })
          this.isPaused = true
        }
        this.storeState()
      },
      start () {
        this.restart()
        console.debug('start recorder')
        this.bus.postMessage({ action: 'start' })
      },
      stop () {
        console.debug('stop recorder')
        this.bus.postMessage({ action: 'stop' })

        this.$chrome.storage.local.get(['recording', 'codeOptions'], ({ recording, codeOptions }) => {
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
        this.showResultsTab = this.isRecording = this.isPaused = false
        this.storeState()
      },
      openOptions () {
        if (this.$chrome.runtime.openOptionsPage) {
          this.$chrome.runtime.openOptionsPage()
        }
      },
      loadState (cb) {
        this.$chrome.storage.local.get(['controls', 'code'], ({ controls, code }) => {
          console.debug('loaded controls', controls)
          if (controls) {
            this.isRecording = controls.isRecording
            this.isPaused = controls.isPaused
          }

          if (code) {
            this.code = code
          }
          cb()
        })
      },
      storeState () {
        this.$chrome.storage.local.set({
          code: this.code,
          controls: {
            isRecording: this.isRecording,
            isPaused: this.isPaused
          }
        })
      },
      setCopying () {
        this.isCopying = true
        setTimeout(() => { this.isCopying = false }, 1500)
      }
    },
    computed: {
      recordingBadgeText () {
        return this.isPaused ? 'paused' : 'recording'
      },
      recordButtonText () {
        return this.isRecording ? 'Stop' : 'Record'
      },
      pauseButtonText () {
        return this.isPaused ? 'Resume' : 'Pause'
      },
      copyLinkText () {
        return this.isCopying ? 'copied!' : 'copy to clipboard'
      }
    }
}
</script>

<style lang="scss" scoped>
  @import "~styles/_variables.scss";
  @import "~styles/_mixins.scss";

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

    .recording-footer {
      @include footer()
    }
    .results-footer {
      @include footer()
    }
  }
</style>
