<template>
  <div class="bg-blue-lightest flex flex-col overflow-hidden">
    <Header @home="goHome" @options="openOptions" @help="toggleHelp" />

    <template v-if="!showHelp">
      <HomeTab v-if="!showResultsTab && !isRecording" @start="toggleRecord" />
      <RecordingTab
        :code="code"
        :is-recording="isRecording"
        :live-events="liveEvents"
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
        <div class="flex">
          <button
            class="font-semibold text-sm text-white bg-blue flex justify-center items-center rounded-sm p-2 mr-3"
            @click="restart"
            v-show="code"
          >
            <img src="@/assets/icons/history.svg" alt="restart recording" />
          </button>
          <button
            v-if="isLoggedIn"
            class="font-semibold text-sm text-white bg-blue flex justify-center items-center rounded-sm p-2"
            @click="run"
            v-show="code"
          >
            <img src="@/assets/icons/zap.svg" class="mr-2" alt="thunder" />
            Run on Checkly
          </button>
          <a
            v-else
            href="https://app.checklyhq.com/signup"
            class="text-xs text-white"
          >
            Signup on Checkly
          </a>
        </div>
        <button @click="copyCode" v-show="code">
          <img
            v-show="!isCopying"
            src="@/assets/icons/duplicate.svg"
            alt="copy code to clipboard"
          />
          <span class="text-white text-xs" v-show="isCopying">copied!</span>
        </button>
      </div>
    </template>
    <HelpTab v-else />

    <div
      class="flex justify-between items-center py-4 px-2"
      v-show="!showResultsTab && isRecording"
    >
      <div class="flex w-1/3">
        <RoundButton @click="toggleRecord" class="mr-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.0602417 1.79518C0.0602417 0.837001 0.837001 0.0602417 1.79518 0.0602417H12.2048C13.163 0.0602417 13.9398 0.837001 13.9398 1.79518V12.2048C13.9398 13.163 13.163 13.9398 12.2048 13.9398H1.79518C0.837001 13.9398 0.0602417 13.163 0.0602417 12.2048V1.79518Z"
              fill="#1F2D3D"
            />
          </svg>
        </RoundButton>
        <RoundButton @click="togglePause" v-show="isRecording">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M4.16669 3.33333C4.16669 2.8731 4.53978 2.5 5.00002 2.5H8.33335C8.79359 2.5 9.16669 2.8731 9.16669 3.33333V16.6667C9.16669 17.1269 8.79359 17.5 8.33335 17.5H5.00002C4.53978 17.5 4.16669 17.1269 4.16669 16.6667V3.33333Z"
              fill="#8492A6"
            />
            <path
              d="M10.8333 3.33333C10.8333 2.8731 11.2064 2.5 11.6666 2.5H15C15.4602 2.5 15.8333 2.8731 15.8333 3.33333V16.6667C15.8333 17.1269 15.4602 17.5 15 17.5H11.6666C11.2064 17.5 10.8333 17.1269 10.8333 16.6667V3.33333Z"
              fill="#8492A6"
            />
          </svg>
        </RoundButton>
      </div>
      <RecordingLabel
        class="w-1/3"
        :text="recordingBadgeText"
        :v-show="isRecording"
      />
      <a href="#" @click="showResultsTab = true" v-show="code">view code</a>
      <div class="w-1/3 flex justify-end">
        <RoundButton v-show="isRecording">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M1.64294 3.14291L0.426777 1.92675C0.269286 1.76926 0 1.8808 0 2.10353V5.74998C0 5.88805 0.111929 5.99998 0.25 5.99998H3.89645C4.11917 5.99998 4.23071 5.73069 4.07322 5.5732L2.715 4.21498C3.89508 2.57019 5.82314 1.5 8.00007 1.5C11.5899 1.5 14.5001 4.41015 14.5001 8C14.5001 11.5899 11.5899 14.5 8.00007 14.5C4.63773 14.5 1.87085 11.9464 1.53446 8.67332C1.49211 8.26128 1.12376 7.96158 0.711712 8.00393C0.299669 8.04628 -2.88747e-05 8.41463 0.0423185 8.82668C0.456521 12.8569 3.86076 16 8.00007 16C12.4183 16 16.0001 12.4183 16.0001 8C16.0001 3.58172 12.4183 0 8.00007 0C5.40771 0 3.10436 1.23301 1.64294 3.14291Z"
              fill="#697280"
            />
          </svg>
        </RoundButton>
      </div>
    </div>

    <Footer v-if="!isRecording && !showResultsTab" />
  </div>
</template>

<script>
import { version } from '../../package.json'

import { uiActions } from '@/services/constants'
import Store from '@/services/store'
import PuppeteerCodeGenerator from '@/services/puppeteer-code-generator'
import PlaywrightCodeGenerator from '@/services/playwright-code-generator'

import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'

import RecordingTab from '@/components/RecordingTab.vue'
import ResultsTab from '@/components/ResultsTab.vue'
import HomeTab from '@/components/HomeTab.vue'
import RoundButton from '@/components/RoundButton.vue'
import RecordingLabel from '@/components/RecordingLabel.vue'

// import HelpTab from '@/components/HelpTab.vue'

const store = new Store('popup')

let bus

export default {
  name: 'App',
  components: {
    ResultsTab,
    RecordingTab,
    HomeTab,
    Header,
    Footer,
    RoundButton,
    RecordingLabel,
  },

  data() {
    return {
      code: '',
      codeForPlaywright: '',
      options: {},
      isLoggedIn: false,
      showResultsTab: false,
      showHelp: false,
      liveEvents: [],
      recording: [],
      isRecording: false,
      isPaused: false,
      isCopying: false,
      bus: null,
      version,
      currentResultTab: null,
    }
  },

  computed: {
    recordingBadgeText() {
      return this.isPaused ? 'Paused' : 'Recording...'
    },
    recordButtonText() {
      return this.isRecording ? 'Stop' : 'Record'
    },
    pauseButtonText() {
      return this.isPaused ? 'Resume' : 'Pause'
    },
  },

  mounted() {
    store.sync()

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
        // bus.postMessage({ action: uiActions.UN_PAUSE })
        this.isPaused = false
      } else {
        // bus.postMessage({ action: uiActions.PAUSE })
        this.isPaused = true
      }
      console.log
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

      chrome.storage.local.get(
        ['recording', 'options'],
        ({ recording, options }) => {
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
        }
      )
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

    toggleHelp() {
      this.trackEvent('Help')
      this.showHelp = !this.showHelp
    },

    trackEvent(event) {
      if (
        this.options &&
        this.options.extension &&
        this.options.extension.telemetry
      ) {
        if (window._gaq) window._gaq.push(['_trackEvent', event, 'clicked'])
      }
    },

    trackPageView() {
      if (
        this.options &&
        this.options.extension &&
        this.options.extension.telemetry
      ) {
        if (window._gaq) window._gaq.push(['_trackPageview'])
      }
    },

    getCodeForCopy() {
      return this.currentResultTab === 'puppeteer'
        ? this.code
        : this.codeForPlaywright
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
  width: 360px;
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
