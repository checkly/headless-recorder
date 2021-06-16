<template>
  <div
    data-test-id="results-tab"
    class="flex flex-col bg-blue-light overflow-hidden mt-2"
  >
    <div class="flex flex-row mb-2">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="text-gray w-1/2 font-semibold text-xs capitalize"
        :class="{ 'text-black': activeTab === tab }"
        @click.prevent="changeTab(tab)"
      >
        {{ tab }}
      </button>
    </div>

    <div class="sc p-2" style="background: #161616">
      <pre
        v-if="code"
        v-highlightjs="code"
        style="background: #161616"
        class="overflow-auto h-100"
      >
      <code ref="code" class="javascript px-2 break-word whitespace-pre-wrap overflow-x-hidden"></code>
      </pre>
      <pre v-else>
        <code>No code yet...</code>
      </pre>
    </div>
  </div>
</template>
<script>
import { headlessTypes } from '@/services/constants'

export default {
  name: 'ResultsTab',
  props: {
    puppeteer: {
      type: String,
      default: '',
    },
    playwright: {
      type: String,
      default: '',
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      activeTab: headlessTypes.PLAYWRIGHT,
      tabs: [headlessTypes.PLAYWRIGHT, headlessTypes.PUPPETEER],
    }
  },

  computed: {
    code() {
      return this.activeTab === headlessTypes.PUPPETEER
        ? this.puppeteer
        : this.playwright
    },
  },

  mounted() {
    if (this.options?.code?.showPlaywrightFirst) {
      this.activeTab = headlessTypes.PLAYWRIGHT
      this.tabs = this.tabs.reverse()
    }
    this.$emit('update:tab', this.activeTab)

    // let line = 1
    // this.$refs.code.innerHTML = `<span class="hljs-line">${line}</span>${this.$refs.code.innerHTML}`
    // this.$refs.code.innerHTML = this.$refs.code.innerHTML.replaceAll(
    //   '\n',
    //   () => {
    //     line += 1
    //     return `\n<span class="hljs-line">${line}</span>`
    //   }
    // )
  },

  methods: {
    changeTab(tab) {
      this.activeTab = tab
      this.$emit('update:tab', tab)
    },
  },
}
</script>

<style scoped>
pre::-webkit-scrollbar {
  height: 8px;
  width: 8px;
  margin-right: 10px;
  padding: 10px;
  background: transparent;
}
pre::-webkit-scrollbar-thumb {
  margin-right: 10px;
  padding: 10px;
  background: #e0e6ed;
  -webkit-border-radius: 0.5rem;
}

pre::-webkit-scrollbar-corner {
  background: yellow;
}
</style>
