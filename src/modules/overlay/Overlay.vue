<template>
  <nav
    v-show="!screenshotMode"
    :class="{ 'hr-event-recorded': hasRecorded && !isPaused && !isStopped, dark: darkMode }"
  >
    <template v-if="isStopped">
      <div class="hr-success-message">
        <h3>Recording finished!</h3>
        <p>You can copy the code to clipboard right away!</p>
      </div>
      <div class="hr-success-bar">
        <button @click="copy" class="hr-btn-large" style="width: 151px;">
          <img
            v-show="!isCopying"
            width="16"
            height="16"
            :src="getIcon('duplicate')"
            alt="copy to clipboard"
          />
          <span v-show="!isCopying">Copy to clipboard</span>
          <span v-show="isCopying">Copied!</span>
        </button>
        <button @click="restart" class="hr-btn-large">
          <img width="16" height="16" :src="getIcon('sync')" alt="restart recording" />
          Restart Recording
        </button>
        <button @click="close" class="btn-close">
          &times;
        </button>
      </div>
    </template>
    <template v-else>
      <div class="hr-rec" v-show="!isPaused">
        <span class="hr-red-dot"></span>
        REC
      </div>
      <button
        class="hr-btn"
        title="stop"
        @click="stop"
        v-tippy="{ content: 'Stop Recording', appendTo: 'parent' }"
      >
        <div class="hr-stop-square"></div>
      </button>
      <button
        class="hr-btn"
        title="pause"
        @click="pause"
        v-tippy="{ content: isPaused ? 'Resume Recording' : 'Pause Recording', appendTo: 'parent' }"
      >
        <img v-show="isPaused" width="27" height="27" :src="getIcon('play')" alt="play" />
        <img v-show="!isPaused" width="27" height="27" :src="getIcon('pause')" alt="pause" />
      </button>
      <div class="hr-separator"></div>
      <button
        :disabled="isPaused"
        class="hr-btn-big"
        @click.prevent="fullScreenshot"
        v-tippy="{ content: 'Full Screenshot', appendTo: 'parent' }"
      >
        <img width="27" height="27" :src="getIcon('screen')" alt="full page sreenshot" />
      </button>
      <button
        :disabled="isPaused"
        class="hr-btn-big"
        @click.prevent="clippedScreenshot"
        v-tippy="{ content: 'Element Screenshot', appendTo: 'parent' }"
      >
        <img width="27" height="27" :src="getIcon('clip')" alt="clipped sreenshot" />
      </button>
      <div class="hr-separator"></div>
      <span class="hr-current-selector">
        {{ currentSelector }}
      </span>
    </template>
  </nav>
</template>

<script>
import { directive } from 'vue-tippy'
import 'tippy.js/dist/tippy.css'

import { mapState, mapMutations } from 'vuex'

export default {
  name: 'Overlay',
  directives: { tippy: directive },

  data() {
    return {
      currentSelector: '',
    }
  },

  computed: {
    ...mapState([
      'isPaused',
      'isStopped',
      'screenshotMode',
      'darkMode',
      'hasRecorded',
      'isCopying',
      'recording',
    ]),
  },

  methods: {
    ...mapMutations(['copy', 'stop', 'close', 'restart']),

    getIcon(icon) {
      return browser.runtime.getURL(`icons/${this.darkMode ? 'dark' : 'light'}/${icon}.svg`)
    },

    pause() {
      this.isPaused ? this.$store.commit('unpause') : this.$store.commit('pause')
    },

    fullScreenshot() {
      this.$store.commit('startScreenshotMode', false)
    },

    clippedScreenshot() {
      this.$store.commit('startScreenshotMode', true)
    },
  },
}
</script>

<style lang="scss">
@import '../../assets/animations.css';

$namespace: 'hr';

#headless-recorder-overlay {
  nav {
    font-family: sans-serif;
    box-sizing: border-box;
    animation-name: slideup;
    border: solid 2px #f9fafc;
    animation-duration: 0.3s;
    animation-iteration-count: 1;
    animation-timing-function: ease-in-out;
    display: flex;
    align-items: center;
    z-index: 2147483647;
    position: fixed;
    bottom: 10px;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    font-size: 12px;
    color: #1f2d3d;
    padding: 20px 16px;
    transition: all 0.1s ease;
    width: 828px;
    height: 72px;
    background: #f9fafc;
    box-shadow: 0px 5px 25px rgba(0, 0, 0, 0.15);
    border-radius: 6px;

    &.#{$namespace}-event-recorded {
      border: solid 2px #45c8f1 !important;
      transition: all 0.1s linear;
    }

    button {
      border: none;
      margin: 0;
      padding: 0;

      overflow: visible;
      background: transparent;
      color: inherit;
      font: inherit;
      line-height: normal;

      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      margin-right: 10px;

      &.#{$namespace}-btn-big {
        padding: 5px 15px;
        background: #eff2f7;
        border-radius: 3px;

        &:disabled {
          cursor: not-allowed;
        }
      }

      &.#{$namespace}-btn {
        padding: 5px 0;
      }

      &.#{$namespace}-btn-large {
        border-radius: 3px;
        background: #eff2f7;
        padding: 9px 17px 9px 8px;
        color: #1f2d3d;
        font-weight: 600;
        margin-right: 16px;

        &:last-of-type {
          margin-right: 0;
        }

        &:hover {
          background: #e0e6ed;
        }

        img {
          margin-right: 8px;
        }
      }

      &.#{$namespace}-btn-close {
        font-size: 18px;
        color: #161616;
        margin-right: 0;
      }
    }

    .#{$namespace}-rec {
      font-family: sans-serif;
      animation: pulse 2s infinite;
      font-size: 12px;
      position: absolute;
      top: 4px;
      left: 4px;
      font-weight: 600;
      color: #ff4949;
      text-transform: uppercase;

      .#{$namespace}-red-dot {
        display: inline-block;
        border-radius: 50%;
        width: 9px;
        height: 9px;
        background: #ff4949;
      }
    }

    .#{$namespace}-separator {
      width: 1px;
      height: 32px;
      background: #e0e6ed;
      margin-right: 0.8rem;
    }

    .#{$namespace}-stop-square {
      width: 24px;
      height: 24px;
      border-radius: 3px;
      background-color: #1f2d3d;
    }

    .#{$namespace}-current-selector {
      font-weight: 500;
      font-size: 10px;
      line-height: 20px;
      font-family: monospace;
    }

    .#{$namespace}-success-bar {
      display: flex;
      width: 60%;
      justify-content: flex-end;
    }

    .#{$namespace}-success-message {
      width: 40%;

      h3 {
        font-size: 14px;
        font-weight: 600;
        margin: 0;
        color: #1f2d3d;
      }

      p {
        font-size: 12px;
        margin: 0;
        color: #3c4858;
      }
    }

    .tippy-box {
      box-shadow: 0px 5px 25px rgba(0, 0, 0, 0.15);
      margin-top: -45px;
      color: #1f2d3d;
      background: #f9fafc;
      border-radius: 4px;
    }

    .tippy-arrow {
      color: #f9fafc;
    }
  }

  nav.dark {
    background: #161616;
    border: solid 2px #161616;
    color: #f9fafc;

    button {
      &.#{$namespace}-btn-big {
        padding: 5px 15px;
        background: #2e2e2e;
        border-radius: 3px;
      }

      &.#{$namespace}-btn-large {
        background: #1f2d3d;
        color: #f9fafc;

        &:hover {
          background: #474747;
        }
      }

      &.#{$namespace}-btn-close {
        color: #fff;
      }

      //   svg {
      //   stroke: #f9fafc;
      //   fill: #f9fafc;
      // }
    }

    .#{$namespace}-success-message {
      h3 {
        color: #fff;
      }

      p {
        color: #e0e6ed;
      }
    }

    .#{$namespace}-separator {
      background: #2e2e2e;
    }

    .#{$namespace}-stop-square {
      background-color: #f9fafc;
    }

    .tippy-box {
      color: #f9fafc;
      background: #161616;
    }

    .tippy-arrow {
      color: #161616;
    }
  }
}
</style>
