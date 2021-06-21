<template>
  <nav v-show="!isScreenShotMode" :class="showBorder ? 'recorded' : ''">
    <div class="rec" v-show="!isPaused">
      <span class="dot"></span>
      REC
    </div>
    <button title="stop" @click="stop" v-tippy="{ content: 'Stop Recording' }">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" rx="3" fill="#1F2D3D" />
      </svg>
    </button>
    <button
      class="btn"
      title="pause"
      @click="pause"
      v-tippy="{ content: isPaused ? 'Resume Recording' : 'Pause Recording' }"
    >
      <svg
        v-show="isPaused"
        width="27"
        height="27"
        viewBox="0 0 27 27"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 3.02515C4 2.22952 4.88996 1.73813 5.58949 2.14743L23.4906 12.6223C24.1698 13.0199 24.1698 13.9801 23.4906 14.3777L5.58949 24.8525C4.88996 25.2619 4 24.7706 4 23.9751V3.02515Z"
          fill="#1F2D3D"
        />
      </svg>

      <svg
        v-show="!isPaused"
        width="27"
        height="27"
        viewBox="0 0 27 27"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M5.625 4.5C5.625 3.87868 6.12868 3.375 6.75 3.375H11.25C11.8713 3.375 12.375 3.87868 12.375 4.5V22.5C12.375 23.1213 11.8713 23.625 11.25 23.625H6.75C6.12868 23.625 5.625 23.1213 5.625 22.5V4.5Z"
          fill="#1F2D3D"
        />
        <path
          d="M14.625 4.5C14.625 3.87868 15.1287 3.375 15.75 3.375H20.25C20.8713 3.375 21.375 3.87868 21.375 4.5V22.5C21.375 23.1213 20.8713 23.625 20.25 23.625H15.75C15.1287 23.625 14.625 23.1213 14.625 22.5V4.5Z"
          fill="#1F2D3D"
        />
      </svg>
    </button>
    <div class="separator"></div>
    <button
      class="btn-big"
      @click.prevent="fullScreenshot"
      v-tippy="{ content: 'Full Screenshot' }"
    >
      <svg
        width="26"
        height="25"
        viewBox="0 0 26 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0 3C0 1.94564 0.854729 1.09091 1.90909 1.09091H15.5454C16.5998 1.09091 17.4545 1.94564 17.4545 3V14.4545C17.4545 15.5089 16.5998 16.3636 15.5454 16.3636H1.90909C0.854728 16.3636 0 15.5089 0 14.4545V3ZM1.90909 2.72727C1.75847 2.72727 1.63636 2.84938 1.63636 3V4.90909H3.81818V2.72727H1.90909ZM5.45454 2.72727V4.90909H7.63636V2.72727H5.45454ZM9.27272 2.72727V4.90909H15.8182V3C15.8182 2.84938 15.6961 2.72727 15.5454 2.72727H9.27272ZM15.8182 6.54545H1.63636V14.4545C1.63636 14.6052 1.75847 14.7273 1.90909 14.7273H15.5454C15.6961 14.7273 15.8182 14.6052 15.8182 14.4545V6.54545Z"
            fill="#1F2D3D"
          />
        </g>
        <rect x="5.81812" y="8.00002" width="18.9091" height="14.5454" fill="#EFF2F7" />
        <path
          d="M10.1822 12.3637L8.93143 12.9891C7.91508 13.4972 7.27307 14.536 7.27307 15.6723V21C7.27307 22.6569 8.61622 24 10.2731 24H21.7276C23.3845 24 24.7276 22.6569 24.7276 21V15.6723C24.7276 14.536 24.0856 13.4972 23.0692 12.9891L21.8185 12.3637"
          stroke="#1F2D3D"
          stroke-width="2"
        />
        <path
          d="M19.6369 13.0909V12.4546C19.6369 10.7977 18.2937 9.45457 16.6369 9.45457H15.3641C13.7073 9.45457 12.3641 10.7977 12.3641 12.4546V13.0909"
          stroke="#1F2D3D"
          stroke-width="2"
        />
        <circle
          cx="16.0005"
          cy="18.1818"
          r="2.63636"
          fill="#F9FAFC"
          stroke="#1F2D3D"
          stroke-width="2"
        />
        <defs>
          <clipPath id="clip0">
            <rect width="17.4545" height="17.4545" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </button>
    <button
      class="btn-big"
      @click.prevent="clippedScreenshot"
      v-tippy="{ content: 'Clipped Screenshot' }"
    >
      <svg
        width="27"
        height="25"
        viewBox="0 0 27 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M2.69329 17.1234L3.52904 15.108C3.78327 15.2135 4.06378 15.2727 4.36364 15.2727H6.54545V17.4545H4.36364C3.77196 17.4545 3.2078 17.3368 2.69329 17.1234ZM10.9091 17.4545V15.2727H13.0909C13.3908 15.2727 13.6713 15.2135 13.9255 15.108L14.7613 17.1234C14.2467 17.3368 13.6826 17.4545 13.0909 17.4545H10.9091ZM17.4545 6.54545H15.2727V4.36364C15.2727 4.06378 15.2135 3.78327 15.108 3.52904L17.1234 2.69329C17.3368 3.2078 17.4545 3.77196 17.4545 4.36364V6.54545ZM6.54545 0H4.36364C3.77196 0 3.2078 0.117758 2.69329 0.331115L3.52904 2.34652C3.78327 2.24109 4.06378 2.18182 4.36364 2.18182H6.54545V0ZM0 10.9091H2.18182V13.0909C2.18182 13.3908 2.24109 13.6713 2.34652 13.9255L0.331115 14.7613C0.117758 14.2467 0 13.6826 0 13.0909V10.9091ZM0 6.54545H2.18182V4.36364C2.18182 4.06378 2.24109 3.78327 2.34652 3.52904L0.331115 2.69329C0.117758 3.2078 0 3.77196 0 4.36364V6.54545ZM10.9091 0V2.18182H13.0909C13.3908 2.18182 13.6713 2.24109 13.9255 2.34652L14.7613 0.331115C14.2467 0.117758 13.6826 0 13.0909 0H10.9091ZM17.4545 10.9091H15.2727V13.0909C15.2727 13.3908 15.2135 13.6713 15.108 13.9255L17.1234 14.7613C17.3368 14.2467 17.4545 13.6826 17.4545 13.0909V10.9091Z"
          fill="#1F2D3D"
        />
        <rect x="6.54541" y="8" width="18.9091" height="14.5455" fill="#EFF2F7" />
        <path
          d="M10.9091 12.3637L9.65836 12.989C8.64201 13.4972 8 14.536 8 15.6723V21C8 22.6569 9.34315 24 11 24H22.4545C24.1114 24 25.4545 22.6569 25.4545 21V15.6723C25.4545 14.536 24.8125 13.4972 23.7962 12.989L22.5455 12.3637"
          stroke="#1F2D3D"
          stroke-width="2"
        />
        <path
          d="M20.3637 13.0909V12.4546C20.3637 10.7977 19.0205 9.45456 17.3637 9.45456H16.0909C14.4341 9.45456 13.0909 10.7977 13.0909 12.4546V13.0909"
          stroke="#1F2D3D"
          stroke-width="2"
        />
        <circle
          cx="16.7273"
          cy="18.1818"
          r="2.63636"
          fill="#F9FAFC"
          stroke="#1F2D3D"
          stroke-width="2"
        />
      </svg>
    </button>
    <div class="separator"></div>
    <span>
      {{ currentSelector }}
    </span>
  </nav>
</template>

<script>
import { directive } from 'vue-tippy'
import { controlMessages } from '@/services/constants'
import 'tippy.js/dist/tippy.css'

export default {
  name: 'Overlay',

  directives: { tippy: directive },

  data() {
    return {
      showBorder: false,
      isPaused: false,
      isScreenShotMode: false,
      currentSelector: '',
    }
  },

  watch: {
    showBorder(newVal, oldVal) {
      if (oldVal === newVal) {
        return
      }
      if (newVal) {
        setTimeout(() => (this.showBorder = false), 250)
      }
    },
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
      chrome.runtime.sendMessage({ control: controlMessages.OVERLAY_STOP })
    },

    pause() {
      this.isPaused = !this.isPaused
      chrome.runtime.sendMessage({ control: controlMessages.OVERLAY_PAUSE })
    },

    fullScreenshot() {
      this.isScreenShotMode = true
      chrome.runtime.sendMessage({
        control: controlMessages.OVERLAY_FULL_SCREENSHOT,
      })
    },

    clippedScreenshot() {
      this.isScreenShotMode = true
      chrome.runtime.sendMessage({
        control: controlMessages.OVERLAY_CLIPPED_SCREENSHOT,
      })
    },
  },
}
</script>

<style lang="scss">
.headless-recorder-flash {
  animation-name: ss-animation;
  animation-duration: 0.5s;
  animation-iteration-count: 1;
  animation-timing-function: ease-in-out;
}

@keyframes ss-animation {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes aa {
  0% {
    transform: translateY(100%);
  }

  50% {
    transform: translateY(-120%);
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
    border: solid 2px #45c8f1;
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
    animation-name: aa;
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
