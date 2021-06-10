<template>
  <div class="bg-blue-light p-4 flex flex-col overflow-hidden">
    <div class="flex justify-between items-center mb-2">
      <h1
        @click="goHome"
        role="button"
        class="text-sm font-semibold text-gray-darkest"
      >
        Headless Recorder
      </h1>
      <div class="flex">
        <div
          data-test-id="recording-badge"
          class="flex justify-center items-center text-red font-semibold"
          :class="{
            'animate-pulse': recordingBadgeText === 'recording',
            'text-yellow-500': recordingBadgeText !== 'recording',
          }"
          v-show="isRecording"
        >
          <span
            data-test-id="red-dot"
            class="bg-red rounded-full w-2 h-2 mr-1"
            :class="{
              'bg-yellow-500': recordingBadgeText !== 'recording',
            }"
          ></span>
          {{ recordingBadgeText }}
        </div>
        <button @click="toggleShowHelp" class="ml-4">
          <img src="@/assets/icons/question.svg" alt="help" class="w-4" />
        </button>
        <button @click="openOptions" class="ml-2">
          <img src="@/assets/icons/gear.svg" alt="settings" class="w-4" />
        </button>
      </div>
    </div>

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
        class="flex py-2 px-3 justify-between bg-black rounded-b-md"
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
    <HelpTab v-show="showHelp" />

    <div
      class="flex justify-between pt-2"
      v-show="!showResultsTab && isRecording"
    >
      <button
        @click="toggleRecord"
        class="font-semibold text-sm text-white bg-red flex items-center rounded-sm p-2.5"
      >
        Finishing Recording
      </button>
      <button
        class="text-sm text-gray-dark"
        @click="togglePause"
        v-show="isRecording"
      >
        {{ pauseButtonText }}
      </button>
      <a href="#" @click="showResultsTab = true" v-show="code">view code</a>
    </div>

    <Footer class="mt-2" v-if="!isRecording && !showResultsTab" />
  </div>
</template>

<script>
import { version } from '../../package.json'

import PuppeteerCodeGenerator from '@/services/PuppeteerCodeGenerator'
import PlaywrightCodeGenerator from '@/services/PlaywrightCodeGenerator'
import RecordingTab from '@/components/RecordingTab.vue'
import ResultsTab from '@/components/ResultsTab.vue'
import HomeTab from '@/components/HomeTab.vue'

// import HelpTab from '@/components/HelpTab.vue'

import Footer from '@/components/Footer.vue'

import actions from '@/models/extension-ui-actions'

let bus

export default {
  name: 'App',
  components: { ResultsTab, RecordingTab, HomeTab, Footer },

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
      return this.isPaused ? 'paused' : 'recording'
    },
    recordButtonText() {
      return this.isRecording ? 'Stop' : 'Record'
    },
    pauseButtonText() {
      return this.isPaused ? 'Resume' : 'Pause'
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
        window.close()
        this.start()
      }
      this.isRecording = !this.isRecording
      this.storeState()
    },

    togglePause() {
      if (this.isPaused) {
        bus.postMessage({ action: actions.UN_PAUSE })
        this.isPaused = false
      } else {
        bus.postMessage({ action: actions.PAUSE })
        this.isPaused = true
      }
      this.storeState()
    },

    start() {
      this.trackEvent('Start')
      this.cleanUp()
      console.debug('start recorder')
      bus.postMessage({ action: actions.START })
    },

    stop() {
      this.trackEvent('Stop')
      console.debug('stop recorder')
      bus.postMessage({ action: actions.STOP })

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
      bus.postMessage({ action: actions.CLEAN_UP })
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

    toggleShowHelp() {
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
      const script = encodeURIComponent(btoa(this.code))
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
</style>
