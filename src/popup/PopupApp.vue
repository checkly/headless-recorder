<template>
  <div class="bg-blue-lightest dark:bg-black flex flex-col overflow-hidden">
    <Header @home="goHome" @options="openOptions" @help="goHelp" @dark="toggleDarkMode" />
    <HomeTab v-if="!showResultsTab && !isRecording" @start="toggleRecord" />
    <RecordingTab
      @stop="toggleRecord"
      @pause="togglePause"
      @restart="reset"
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
      <Button class="mr-2" @click="copyCode" v-show="code">
        <img
          v-show="!isCopying"
          src="@/assets/icons/duplicate.svg"
          class="mr-1"
          alt="copy code to clipboard"
        />
        <span v-show="!isCopying">Copy to clipboard</span>
        <span class="text-white text-xs" v-show="isCopying">copied!</span>
      </Button>
      <Button v-if="isLoggedIn" @click="run" v-show="code">
        <img src="/icons/dark/zap.svg" class="mr-1" alt="thunder" />
        Run on Checkly
      </Button>
      <a v-else href="https://app.checklyhq.com/signup" class="text-xs text-white">
        Signup on Checkly
      </a>
    </div>

    <Footer v-if="!isRecording && !showResultsTab" />
  </div>
</template>

<script>
import { uiActions, isDarkMode } from '@/services/constants'
import PuppeteerCodeGenerator from '@/services/puppeteer-code-generator'
import PlaywrightCodeGenerator from '@/services/playwright-code-generator'

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
      code: '',
      codeForPlaywright: '',
      options: {
        extension: {
          darkMode: isDarkMode(),
        },
        code: {},
      },
      isLoggedIn: false,
      showResultsTab: false,
      liveEvents: [],
      recording: [],
      isRecording: false,
      isPaused: false,
      isCopying: false,
      currentResultTab: null,
    }
  },

  watch: {
    'options.extension.darkMode': {
      handler(newVal) {
        console.log(newVal)
        document.body.classList[newVal ? 'add' : 'remove']('dark')
      },
      immediate: true,
    },
  },

  mounted() {
    this.loadState(() => {
      this.trackPageView()
      if (this.isRecording) {
        console.debug('opened in recording state, fetching recording events')
        chrome.storage.local.get(
          ['recording', 'options', 'clear', 'pause'],
          ({ recording, clear, pause }) => {
            console.debug('loaded recording', recording)
            this.liveEvents = recording

            if (clear) {
              this.toggleRecord()
              chrome.storage.local.remove(['clear'])
            }

            if (pause) {
              this.togglePause()
              chrome.storage.local.remove(['pause'])
            }
          }
        )
      }

      if (!this.isRecording && this.code) {
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
        // window.close()
        this.start()
      }

      this.isRecording = !this.isRecording
      this.storeState()
    },

    togglePause() {
      if (this.isPaused) {
        bus.postMessage({ action: uiActions.UN_PAUSE })
        this.isPaused = false
      } else {
        bus.postMessage({ action: uiActions.PAUSE })
        this.isPaused = true
      }
      this.storeState()
    },

    start() {
      this.trackEvent('Start')
      this.cleanUp()
      console.debug('start recorder')
      bus.postMessage({ action: uiActions.START })
    },

    stop() {
      this.trackEvent('Stop')
      console.debug('stop recorder')
      bus.postMessage({ action: uiActions.STOP })

      chrome.storage.local.get(['recording', 'options'], ({ recording, options }) => {
        console.debug('loaded recording', recording)
        console.debug('loaded options', options)

        this.recording = recording
        const codeOptions = options ? options.code : {}

        const codeGen = new PuppeteerCodeGenerator(codeOptions)
        const codeGenPlaywright = new PlaywrightCodeGenerator(codeOptions)
        this.code = codeGen.generate(this.recording)
        this.codeForPlaywright = codeGenPlaywright.generate(this.recording)
        this.showResultsTab = true
        this.storeState()
      })
    },

    restart() {
      this.cleanUp()
      bus.postMessage({ action: uiActions.CLEAN_UP })
    },

    reset() {
      this.cleanUp()
      bus.postMessage({ action: uiActions.CLEAN_UP })
      this.toggleRecord()
    },

    cleanUp() {
      this.recording = this.liveEvents = []
      this.code = ''
      this.codeForPlaywright = ''
      this.showResultsTab = this.isRecording = this.isPaused = false
      this.storeState()
    },

    openOptions() {
      this.trackEvent('Options')
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

    copyCode() {
      navigator.permissions.query({ name: 'clipboard-write' }).then(result => {
        if (result.state == 'granted' || result.state == 'prompt') {
          this.trackEvent('Copy')
          this.isCopying = true
          setTimeout(() => {
            this.isCopying = false
            navigator.clipboard.writeText(this.code)
          }, 500)
        }
      })
    },

    goHome() {
      this.showResultsTab = false
      this.showHelp = false
    },

    goHelp() {
      const url = 'https://www.checklyhq.com/docs/headless-recorder/'
      chrome.tabs.create({ url })
    },

    trackEvent(event) {
      if (this.options && this.options.extension && this.options.extension.telemetry) {
        window._gaq && window._gaq.push(['_trackEvent', event, 'clicked'])
      }
    },

    trackPageView() {
      if (this.options && this.options.extension && this.options.extension.telemetry) {
        window._gaq && window._gaq.push(['_trackPageview'])
      }
    },

    toggleDarkMode() {
      this.options.extension.darkMode = !this.options.extension.darkMode
      chrome.storage.local.set({ options: this.options })
    },

    getCodeForCopy() {
      return this.currentResultTab === 'puppeteer' ? this.code : this.codeForPlaywright
    },

    run() {
      const script = encodeURIComponent(btoa(this.getCodeForCopy()))
      const url = `https://app.checklyhq.com/checks/new/browser?framework=${this.currentResultTab}&script=${script}`
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
