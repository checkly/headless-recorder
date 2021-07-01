<template>
  <div class="overlay">
    <div :class="selectorClass" ref="selector"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      overlay: null,
      selector: null,
      element: null,
      scrolling: false,
      dimensions: {},
    }
  },

  computed: {
    ...mapState(['screenshotClippedMode', 'screenshotMode', 'isStopped']),

    selectorClass() {
      if (this.isStopped) {
        return ''
      }

      if (!this.screenshotMode || this.screenshotClippedMode) {
        return this.scrolling ? 'hide selector' : 'selector'
      }

      return ''
    },
  },

  methods: {
    move(e, skippedSelectors = []) {
      if (this.element === e.target) {
        return
      }

      this.element = e.target

      if (skippedSelectors.includes(this.element.id)) {
        return
      }

      this.dimensions.top = -window.scrollY
      this.dimensions.left = -window.scrollX

      let elem = e.target

      while (elem && elem !== document.body) {
        this.dimensions.top += elem.offsetTop
        this.dimensions.left += elem.offsetLeft
        elem = elem.offsetParent
      }

      this.dimensions.width = this.element.offsetWidth + 2
      this.dimensions.height = this.element.offsetHeight + 2

      this.$refs.selector.style.top = this.dimensions.top - 2 + 'px'
      this.$refs.selector.style.left = this.dimensions.left - 2 + 'px'
      this.$refs.selector.style.width = this.dimensions.width + 'px'
      this.$refs.selector.style.height = this.dimensions.height + 'px'
    },

    // TODO: Integrate shooter with selector
    click(e) {
      setTimeout(() => {
        let clip = null

        if (this.$refs.selector) {
          clip = {
            x: this.$refs.selector.style.left,
            y: this.$refs.selector.style.top,
            width: this.$refs.selector.style.width,
            height: this.$refs.selector.style.height,
          }
        }

        this.$emit('click', { clip, raw: e })
      }, 100)
    },
  },
}
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2147483646;
}

.selector {
  padding: 1px;
  position: fixed;
  background: rgba(255, 73, 73, 0.1);
  border: 2px dashed rgba(255, 73, 73, 0.7);
}

.hide {
  display: none;
}
</style>
