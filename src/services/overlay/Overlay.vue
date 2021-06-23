<template>
  <nav v-show="!screenshotMode" :class="{ recorded: hasRecorded, dark: darkMode }">
    <template v-if="isStopped">
      <div>
        <p>Recording finished!</p>
        <p>You can copy the code to clipboard right away!</p>
      </div>
      <div>
        <Button>
          <img width="16" height="16" :src="getIcon('sync')" alt="full page sreenshot" />
          Copy to clipboard
        </Button>
        <Button>
          <img width="16" height="16" :src="getIcon('sync')" alt="full page sreenshot" />
          Restart Recording
        </Button>
      </div>
    </template>
    <template v-else>
      <div class="rec" v-show="!isPaused">
        <span class="dot"></span>
        REC
      </div>
      <button title="stop" @click="stop" v-tippy="{ content: 'Stop Recording' }">
        <div class="stop"></div>
      </button>
      <button
        class="btn"
        title="pause"
        @click="pause"
        v-tippy="{ content: isPaused ? 'Resume Recording' : 'Pause Recording' }"
      >
        <img v-show="isPaused" width="27" height="27" :src="getIcon('play')" alt="play" />
        <img v-show="!isPaused" width="27" height="27" :src="getIcon('pause')" alt="pause" />
      </button>
      <div class="separator"></div>
      <button
        class="btn-big"
        @click.prevent="fullScreenshot"
        v-tippy="{ content: 'Full Screenshot' }"
      >
        <img width="27" height="27" :src="getIcon('screen')" alt="full page sreenshot" />
      </button>
      <button
        class="btn-big"
        @click.prevent="clippedScreenshot"
        v-tippy="{ content: 'Clipped Screenshot' }"
      >
        <img width="27" height="27" :src="getIcon('clip')" alt="clipped sreenshot" />
      </button>
      <div class="separator"></div>
      <span>
        {{ currentSelector }}
      </span>
    </template>
  </nav>
</template>

<script>
import { directive } from 'vue-tippy'
import { controlMessages } from '@/services/constants'
import 'tippy.js/dist/tippy.css'

import {mapState} from 'vuex'

import Button from '@/components/Button'

export default {
  name: 'Overlay',
  components: { Button },
  directives: { tippy: directive },

  data() {
    return {
      currentSelector: '',
    }
  },

  computed: {
    ...mapState(['isPaused', 'isStopped', 'screenshotMode', 'darkMode', 'hasRecorded'])
  },

  mounted() {
    document.body.addEventListener('keyup', e => {
      if (e.code !== 'Escape') {
        return
      }

      chrome.runtime.sendMessage({
        control: controlMessages.OVERLAY_ABORT_SCREENSHOT,
      })
    })
  },

  methods: {
    stop() {
      this.$store.commit('stop')
    },

    getIcon(icon) {
      return browser.runtime.getURL(`icons/${this.darkMode ? 'dark' : 'light'}/${icon}.svg`)
    },

    pause() {
      this.$store.commit('pause')
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
.headless-recorder-flash {
  animation-name: flash;
  animation-duration: 0.5s;
  animation-iteration-count: 1;
  animation-timing-function: ease-in-out;
}

@keyframes flash {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideup {
  0% {
    transform: translateY(100%);
  }

  100% {
    transform: translateY(0%);
  }
}

.headless-recorder-camera-cursor {
  cursor: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACMSURBVHgBzZDrDUBAEITnVEIHVIoKUAkd0MHphCXrstm4R/jBJF9yu5d9DfAXWWJT2DfFqVjDj0NGNd6QoEwVSC61RMEDKmLAzSQfHZETI8czx40cFGpQcpHMjdzkjA3Ct/r+XT5DWDkxqdzCmzmFTqi5yazW75HowWVkKTaq5X/Mg6gOD1Y814rPtQPiEFi9rPKoQQAAAABJRU5ErkJggg=='),
    auto;
}

#headless-recorder-overlay {
  .recorded {
    border: solid 2px #45c8f1 !important;
    transition: all 0.1s linear;
  }

  .rec {
    font-family: sans-serif;
    font-size: 12px;
    position: absolute;
    top: 4px;
    left: 4px;
    font-weight: 600;
    color: #ff4949;
    text-transform: uppercase;
  }

  .dot {
    display: inline-block;
    border-radius: 50%;
    width: 9px;
    height: 9px;
    background: #ff4949;
  }

  nav {
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
    font-family: monospace;
    font-size: 12px;
    color: #1f2d3d;
    padding: 20px 16px;
    transition: all 0.1s ease;
    width: 828px;
    height: 72px;
    background: #f9fafc;
    box-shadow: 0px 5px 25px rgba(0, 0, 0, 0.15);
    border-radius: 6px;
  }

  nav.dark {
    background: #161616;
    border: solid 2px #161616;
    color: #f9fafc;

    .btn-big {
      padding: 5px 15px;
      background: #2e2e2e;
      border-radius: 3px;
    }

    svg {
      stroke: #f9fafc;
      fill: #f9fafc;
    }

    .separator {
      background: #2e2e2e;
    }

    .stop {
      background-color: #f9fafc;
    }
  }

  .separator {
    width: 1px;
    height: 32px;
    background: #e0e6ed;
    margin-right: 0.8rem;
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
    -webkit-font-smoothing: inherit;
    -moz-osx-font-smoothing: inherit;
    -webkit-appearance: none;

    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin-right: 10px;

    &.btn-big {
      padding: 5px 15px;
      background: #eff2f7;
      border-radius: 3px;
    }
  }

  .stop {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background-color: #1f2d3d;
  }

  span {
    font-weight: 600;
    font-size: 10px;
    line-height: 20px;
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
</style>
