<template>
  <div class="bg-blue-light p-4 flex flex-col overflow-hidden">
    <div class="flex justify-between items-center mb-2">
      <h1 @click="goHome" role="button" class="text-sm font-semibold text-gray-darkest">
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
          <a v-else href="https://app.checklyhq.com/signup" class="text-xs text-white">
            Signup on Checkly
          </a>
        </div>
        <!-- <button @click="copyCode" v-show="code">
          <img
            v-show="!isCopying"
            src="@/assets/icons/duplicate.svg"
            alt="copy code to clipboard"
          />
          <span class="text-white text-xs" v-show="isCopying">copied!</span>
        </button> -->
      </div>
    </template>
    <HelpTab v-show="showHelp" />

    <div class="flex justify-between pt-2" v-show="!showResultsTab && isRecording">
      <button
        @click="toggleRecord"
        class="font-semibold text-sm text-white bg-red flex items-center rounded-sm p-2.5"
      >
        Finishing Recording
      </button>
      <button class="text-sm text-gray-dark" @click="togglePause" v-show="isRecording">
        {{ pauseButtonText }}
      </button>
      <a href="#" @click="showResultsTab = true" v-show="code">view code</a>
    </div>

    <Footer class="mt-2" v-if="!isRecording && !showResultsTab" />
  </div>
</template>

<script>
import { version } from '../../package.json'

import store from '@/services/store'
import browser from '@/services/browser'

import { uiActions } from '@/services/constants'
import PuppeteerCodeGenerator from '@/services/puppeteer-code-generator'
import PlaywrightCodeGenerator from '@/services/playwright-code-generator'

import RecordingTab from '@/components/RecordingTab.vue'
import ResultsTab from '@/components/ResultsTab.vue'
import HomeTab from '@/components/HomeTab.vue'
import Footer from '@/components/Footer.vue'

// import HelpTab from '@/components/HelpTab.vue'

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

  async mounted() {
    bus = browser.getBus()
    const state = await store.load()
    this.loadState(state)
    this.isLoggedIn = (await browser.getChecklyCookie()) ? true : false
  },

  methods: {
    toggleRecord() {
      this.isRecording ? this.stop() : this.start()
      this.isRecording = !this.isRecording
      this.storeState()
    },

    togglePause() {
      bus.postMessage({ action: this.isPaused ? uiActions.UN_PAUSE : uiActions.PAUSE })
      this.isPaused = !this.isPaused
      this.storeState()
    },

    start() {
      this.cleanUp()
      bus.postMessage({ action: uiActions.START })
    },

    async stop() {
      bus.postMessage({ action: uiActions.STOP })

      const { recording, options } = await store.load(['recording', 'options'])
      console.log(recording, options)

      const codeOptions = options ? options.code : {}
      const pupeteerCode = new PuppeteerCodeGenerator(codeOptions)
      const playwrightCode = new PlaywrightCodeGenerator(codeOptions)

      this.recording = recording
      this.code = pupeteerCode.generate(this.recording)
      this.codeForPlaywright = playwrightCode.generate(this.recording)
      this.showResultsTab = true

      this.storeState()
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
      store.cleanUp()
    },

    openOptions() {
      browser.openOptions()
    },

    async loadState({ controls, code, options, codeForPlaywright, clear, pause, recording }) {
      console.log({ controls, code, options, codeForPlaywright, clear, pause, recording })
      if (controls) {
        this.isRecording = controls.isRecording
        this.isPaused = controls.isPaused

        if (this.isRecording) {
          this.liveEvents = recording

          if (clear) {
            chrome.storage.local.remove(['clear'])
            this.toggleRecord()
          }

          if (pause) {
            chrome.storage.local.remove(['pause'])
            this.togglePause()
          }
        }
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

      if (!this.isRecording && this.code) {
        this.showResultsTab = true
      }
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

    goHome() {
      this.showResultsTab = false
      this.showHelp = false
    },

    toggleShowHelp() {
      this.showHelp = !this.showHelp
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
  width: 360px;
  height: 535px;
}
</style>
