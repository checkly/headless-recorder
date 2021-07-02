<template>
  <div
    data-test-id="results-tab"
    class="flex flex-col bg-blue-light overflow-hidden mt-4 h-100 dark:bg-black"
  >
    <div class="flex flex-row">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="w-1/2 p-2 font-semibold text-xs capitalize rounded-t"
        :class="
          activeTab === tab
            ? 'bg-black text-gray-lightest dark:bg-black-shady'
            : 'text-gray-dark dark:text-gray'
        "
        @click.prevent="changeTab(tab)"
      >
        {{ tab }}
      </button>
    </div>

    <div class="sc p-2 bg-black dark:bg-black-shady">
      <pre
        v-if="code"
        v-highlightjs="code"
        class="overflow-auto bg-black dark:bg-black-shady h-100"
      >
      <code ref="code" class="javascript bg-black dark:bg-black-shady px-2 break-word whitespace-pre-wrap overflow-x-hidden"></code>
      </pre>
      <pre v-else>
        <code>No code yet...</code>
      </pre>
    </div>
  </div>
</template>
<script>
import { headlessTypes } from '@/modules/code-generator/constants'

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
      return this.activeTab === headlessTypes.PUPPETEER ? this.puppeteer : this.playwright
    },
  },

  mounted() {
    if (!this.options?.code?.showPlaywrightFirst) {
      this.activeTab = headlessTypes.PUPPETEER
      this.tabs = this.tabs.reverse()
    }

    this.$emit('update:tab', this.activeTab)
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
  border-radius: 0.5rem;
}

pre::-webkit-scrollbar-corner {
  background: yellow;
}
</style>
