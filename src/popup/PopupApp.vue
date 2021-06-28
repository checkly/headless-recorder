<template>
  <div class="bg-blue-lightest dark:bg-black flex flex-col overflow-hidden">
    <Header @options="openOptions" @help="goHelp" @dark="toggleDarkMode" />
    <HomeTab v-if="!showResultsTab && !isRecording" @start="toggleRecord" />
    <RecordingTab
      @stop="toggleRecord"
      @pause="togglePause"
      @restart="restart"
      :is-recording="isRecording"
      :is-paused="isPaused"
      :dark-mode="options.extension.darkMode"
      v-show="!showResultsTab && isRecording"
    />
    <ResultsTab
      :puppeteer="code"
      :playwright="codeForPlaywright"
      :options="options"
      v-if="showResultsTab"
      v-on:update:tab="currentResultTab = $event"
    />
    <div
      data-test-id="results-footer"
      class="flex py-2 px-3 justify-between bg-black-shady"
      v-show="showResultsTab"
    >
      <Button class="mr-2" @click="restart" v-show="code">
        <img src="/icons/dark/sync.svg" class="mr-1" alt="restart recording" />
        Restart
      </Button>
      <Button class="mr-2 w-34" @click="copyCode" v-show="code">
        <img
          v-show="!isCopying"
          src="/icons/dark/duplicate.svg"
          class="mr-1"
          alt="copy code to clipboard"
        />
        <span v-show="!isCopying">Copy to clipboard</span>
        <span v-show="isCopying">copied!</span>
      </Button>
      <Button v-if="isLoggedIn" @click="run" v-show="code">
        <img src="/icons/dark/zap.svg" class="mr-1" alt="thunder" />
        Run on Checkly
      </Button>
      <a v-else href="https://app.checklyhq.com/signup">
        Signup on Checkly
      </a>
    </div>

    <Footer v-if="!isRecording && !showResultsTab" />
  </div>
</template>

<script>
import analytics from '@/services/analytics'
import browser from '@/services/browser'
import CodeGenerator from '@/modules/code-generator'
import { uiActions, isDarkMode, urls } from '@/services/constants'

import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'

import HomeTab from '@/components/HomeTab.vue'
import ResultsTab from '@/components/ResultsTab.vue'
import RecordingTab from '@/components/RecordingTab.vue'
import Button from '@/components/Button.vue'

let bus

export default {
  name: 'App',
  components: {
    ResultsTab,
    RecordingTab,
    HomeTab,
    Header,
    Footer,
    Button,
  },

  data() {
    return {
      isLoggedIn: false,
      showResultsTab: false,
      isRecording: false,
      isPaused: false,
      isCopying: false,
      currentResultTab: null,

      liveEvents: [],
      recording: [],

      code: '',
      codeForPlaywright: '',
      options: {
        extension: {
          darkMode: isDarkMode(),
        },
        code: {},
      },
    }
  },

  watch: {
    'options.extension.darkMode': {
      handler(newVal) {
        document.body.classList[newVal ? 'add' : 'remove']('dark')
      },
      immediate: true,
    },
  },

  mounted() {
    this.loadState(() => {
      analytics.trackPageView(this.options)

      if (this.isRecording) {
        console.debug('opened in recording state, fetching recording events')
        chrome.storage.local.get(
          ['recording', 'options', 'clear', 'pause'],
          ({ recording, clear, pause }) => {
            this.liveEvents = recording

            if (clear) {
              this.toggleRecord()
              chrome.storage.local.remove(['clear'])
            }

            if (pause) {
              console.log('pausing..')
              this.togglePause(true)
              chrome.storage.local.remove(['pause'])
            }
          }
        )
      } else if (this.code) {
        this.showResultsTab = true
      }
    })

    bus = chrome.extension.connect({ name: 'recordControls' })

    chrome.cookies.getAll({}, res => {
      if (res.find(cookie => cookie.name.startsWith('checkly_has_account'))) {
        this.isLoggedIn = true
      }
    })
  },

  methods: {
    toggleRecord() {
      if (this.isRecording) {
        this.stop()
      } else {
        window.close()
        this.start()
      }

      this.isRecording = !this.isRecording
      this.storeState()
    },

    togglePause(stop = false) {
      if (this.isPaused) {
        bus.postMessage({ action: uiActions.UN_PAUSE, stop })
        this.isPaused = false
      } else {
        bus.postMessage({ action: uiActions.PAUSE, stop })
        this.isPaused = true
      }

      this.storeState()
    },

    start() {
      analytics.trackEvent({ options: this.options, event: 'Start' })
      this.cleanUp()
      bus.postMessage({ action: uiActions.START })
    },

    stop() {
      analytics.trackEvent({ options: this.options, event: 'Stop' })

      bus.postMessage({ action: uiActions.STOP })

      chrome.storage.local.get(['recording', 'options'], ({ recording, options = {} }) => {
        const generator = new CodeGenerator(options)
        const { puppeteer, playwright } = generator.generate(recording)

        this.showResultsTab = true
        this.recording = recording
        this.code = puppeteer
        this.codeForPlaywright = playwright

        this.storeState()
      })
    },

    restart() {
      this.cleanUp()
      bus.postMessage({ action: uiActions.CLEAN_UP })
    },

    cleanUp() {
      this.recording = this.liveEvents = []
      this.code = ''
      this.codeForPlaywright = ''
      this.showResultsTab = this.isRecording = this.isPaused = false
      this.storeState()
    },

    openOptions() {
      analytics.trackEvent({ options: this.options, event: 'Options' })
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage()
      }
    },

    loadState(cb) {
      chrome.storage.local.get(
        ['controls', 'code', 'options', 'codeForPlaywright'],
        ({ controls, code, options, codeForPlaywright }) => {
          if (controls) {
            this.isRecording = controls.isRecording
            this.isPaused = controls.isPaused
          }

          if (code) {
            this.code = code
          }

          if (codeForPlaywright) {
            this.codeForPlaywright = codeForPlaywright
          }

          if (options) {
            this.options = options
          }
          cb()
        }
      )
    },

    storeState() {
      chrome.storage.local.set({
        code: this.code,
        codeForPlaywright: this.codeForPlaywright,
        controls: {
          isRecording: this.isRecording,
          isPaused: this.isPaused,
        },
      })
    },

    async copyCode() {
      this.isCopying = true
      await browser.copyToClipboard(this.getCode())
      setTimeout(() => (this.isCopying = false), 500)
    },

    goHelp() {
      chrome.tabs.create({ url: urls.DOCS_URL })
    },

    toggleDarkMode() {
      this.options.extension.darkMode = !this.options.extension.darkMode
      chrome.storage.local.set({ options: this.options })
    },

    getCode() {
      return this.currentResultTab === 'puppeteer' ? this.code : this.codeForPlaywright
    },

    run() {
      const script = encodeURIComponent(btoa(this.getCode()))
      const url = `${urls.RUN_URL}?framework=${this.currentResultTab}&script=${script}`
      chrome.tabs.create({ url })
    },
  },
}
</script>

<style>
html {
  width: 386px;
  height: 535px;
}

button:focus-visible {
  outline: none;
  box-shadow: 0 0 2px 2px #51a7e8;
}

button:focus {
  outline: 0;
}
</style>
