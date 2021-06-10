<template>
  <div id="headless-recorder" class="recorder">
    <div class="header">
      <a href="#" @click="goHome">
        Headless recorder
        <span class="text-muted"
          ><small>{{ version }}</small></span
        >
      </a>
      <div class="left">
        <div class="recording-badge" v-show="isRecording">
          <span class="red-dot"></span>
          {{ recordingBadgeText }}
        </div>
        <button @click="toggleShowHelp" class="header-button">
          <img src="@/assets/images/help.svg" alt="help"/>
        </button>
        <button @click="openOptions" class="header-button">
          <img src="@/assets/images/settings.svg" alt="settings"/>
        </button>
      </div>
    </div>
    <div class="main">
      <div class="tabs" v-show="!showHelp">
        <RecordingTab
          :code="code"
          :is-recording="isRecording"
          :live-events="liveEvents"
          v-show="!showResultsTab"
        />
        <div class="recording-footer" v-show="!showResultsTab">
          <button
            class="btn btn-sm"
            @click="toggleRecord"
            :class="isRecording ? 'btn-danger' : 'btn-primary'"
          >
            {{ recordButtonText }}
          </button>
          <button
            class="btn btn-sm btn-primary btn-outline-primary"
            @click="togglePause"
            v-show="isRecording"
          >
            {{ pauseButtonText }}
          </button>
          <a href="#" @click="showResultsTab = true" v-show="code">view code</a>
          <checkly-badge v-if="!isRecording"></checkly-badge>
        </div>
        <ResultsTab
          :puppeteer="code"
          :playwright="codeForPlaywright"
          :options="options"
          v-if="showResultsTab"
          v-on:update:tab="currentResultTab = $event"
        />
        <div class="results-footer" v-show="showResultsTab">
          <button class="btn btn-sm btn-primary" @click="restart" v-show="code">
            Restart
          </button>
          <a href="#" @click.prevent="setCopying" v-show="code">{{
            copyLinkText
          }}</a>
        </div>
      </div>
      <HelpTab v-show="showHelp"></HelpTab>
    </div>
  </div>
</template>

<script>
import { version } from "../../package.json";

import PuppeteerCodeGenerator from "@/services/PuppeteerCodeGenerator";
import PlaywrightCodeGenerator from "@/services/PlaywrightCodeGenerator";
import RecordingTab from "@/components/RecordingTab.vue";
import ResultsTab from "@/components/ResultsTab.vue";
import HelpTab from "@/components/HelpTab.vue";
import ChecklyBadge from "@/components/ChecklyBadge.vue";

import actions from "@/models/extension-ui-actions";

let bus;

export default {
  name: "App",
  components: { ResultsTab, RecordingTab, HelpTab, ChecklyBadge },
  data() {
    return {
      code: "",
      codeForPlaywright: "",
      options: {},
      showResultsTab: false,
      showHelp: false,
      liveEvents: [],
      recording: [],
      isRecording: false,
      isPaused: false,
      isCopying: false,
      bus: null,
      version,
      currentResultTab: null
    };
  },
  mounted() {
    this.loadState(() => {
      this.trackPageView();
      if (this.isRecording) {
        console.debug("opened in recording state, fetching recording events");
        chrome.storage.local.get(["recording", "options"], ({ recording }) => {
          console.debug("loaded recording", recording);
          this.liveEvents = recording;
        });
      }

      if (!this.isRecording && this.code) {
        this.showResultsTab = true;
      }
    });

    bus = chrome.extension.connect({ name: "recordControls" });
  },
  methods: {
    toggleRecord() {
      if (this.isRecording) {
        this.stop();
      } else {
        this.start();
      }
      this.isRecording = !this.isRecording;
      this.storeState();
    },
    togglePause() {
      if (this.isPaused) {
        bus.postMessage({ action: actions.UN_PAUSE });
        this.isPaused = false;
      } else {
        bus.postMessage({ action: actions.PAUSE });
        this.isPaused = true;
      }
      this.storeState();
    },
    start() {
      this.trackEvent("Start");
      this.cleanUp();
      console.debug("start recorder");
      bus.postMessage({ action: actions.START });
    },
    stop() {
      this.trackEvent("Stop");
      console.debug("stop recorder");
      bus.postMessage({ action: actions.STOP });

      chrome.storage.local.get(
        ["recording", "options"],
        ({ recording, options }) => {
          console.debug("loaded recording", recording);
          console.debug("loaded options", options);

          this.recording = recording;
          const codeOptions = options ? options.code : {};

          const codeGen = new PuppeteerCodeGenerator(codeOptions);
          const codeGenPlaywright = new PlaywrightCodeGenerator(codeOptions);
          this.code = codeGen.generate(this.recording);
          this.codeForPlaywright = codeGenPlaywright.generate(this.recording);
          this.showResultsTab = true;
          this.storeState();
        }
      );
    },
    restart() {
      this.cleanUp();
      bus.postMessage({ action: actions.CLEAN_UP });
    },
    cleanUp() {
      this.recording = this.liveEvents = [];
      this.code = "";
      this.codeForPlaywright = "";
      this.showResultsTab = this.isRecording = this.isPaused = false;
      this.storeState();
    },
    openOptions() {
      this.trackEvent("Options");
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      }
    },
    loadState(cb) {
      chrome.storage.local.get(
        ["controls", "code", "options", "codeForPlaywright"],
        ({ controls, code, options, codeForPlaywright }) => {
          if (controls) {
            this.isRecording = controls.isRecording;
            this.isPaused = controls.isPaused;
          }

          if (code) {
            this.code = code;
          }

          if (codeForPlaywright) {
            this.codeForPlaywright = codeForPlaywright;
          }

          if (options) {
            this.options = options;
          }
          cb();
        }
      );
    },
    storeState() {
      chrome.storage.local.set({
        code: this.code,
        codeForPlaywright: this.codeForPlaywright,
        controls: {
          isRecording: this.isRecording,
          isPaused: this.isPaused
        }
      });
    },
    setCopying() {
      this.trackEvent("Copy");
      this.isCopying = true;
      setTimeout(() => {
        this.isCopying = false;
      }, 1500);
    },
    goHome() {
      this.showResultsTab = false;
      this.showHelp = false;
    },
    toggleShowHelp() {
      this.trackEvent("Help");
      this.showHelp = !this.showHelp;
    },
    trackEvent(event) {
      if (
        this.options &&
        this.options.extension &&
        this.options.extension.telemetry
      ) {
        if (window._gaq) window._gaq.push(["_trackEvent", event, "clicked"]);
      }
    },
    trackPageView() {
      if (
        this.options &&
        this.options.extension &&
        this.options.extension.telemetry
      ) {
        if (window._gaq) window._gaq.push(["_trackPageview"]);
      }
    },
    getCodeForCopy() {
      return this.currentResultTab === "puppeteer"
        ? this.code
        : this.codeForPlaywright;
    }
  },
  computed: {
    recordingBadgeText() {
      return this.isPaused ? "paused" : "recording";
    },
    recordButtonText() {
      return this.isRecording ? "Stop" : "Record";
    },
    pauseButtonText() {
      return this.isPaused ? "Resume" : "Pause";
    },
    copyLinkText() {
      return this.isCopying ? "copied!" : "copy to clipboard";
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/_animations.scss";
@import "../assets/styles/_variables.scss";
@import "../assets/styles/_mixins.scss";
.recorder {
  font-size: 14px;

  .header {
    @include header();

    &-button {
      color: $gray-dark;
      background-color: transparent;
      border: none;
      cursor: pointer;

      img {
        width: 18px;
      }
    }

    .left {
      margin-left: auto;
      display: flex;
      justify-content: flex-start;
      align-items: center;

      .recording-badge {
        color: $brand-danger;
        .red-dot {
          height: 9px;
          width: 9px;
          background-color: $brand-danger;
          border-radius: 50%;
          display: inline-block;
          margin-right: 0.4rem;
          vertical-align: middle;
          position: relative;
        }
      }

      .header-button {
        margin-left: $spacer;
        img {
          vertical-align: middle;
        }
      }
    }
  }

  .recording-footer {
    @include footer();
    img {
      margin-left: 8px;
      width: 80px;
      vertical-align: middle;
    }
  }
  .results-footer {
    @include footer();
  }
}
</style>
