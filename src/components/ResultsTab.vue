<template>
  <div
    data-test-id="results-tab"
    class="flex flex-col  bg-blue-light pt-2 overflow-hidden"
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

    <pre
      v-if="code()"
      v-highlightjs="code()"
      style="background: #2b2b2b"
      class="overflow-auto px-2 h-100"
    >
        <code class="javascript px-2 break-word whitespace-pre-wrap overflow-x-hidden">
        </code>
      </pre>
    <pre v-else>
        <code>No code yet...</code>
      </pre>
  </div>
</template>
<script>
export const TYPE = {
  PUPPETEER: 'puppeteer',
  PLAYWRIGHT: 'playwright',
}

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
      activeTab: TYPE.PUPPETEER,
      tabs: [TYPE.PUPPETEER, TYPE.PLAYWRIGHT],
    }
  },
  mounted() {
    if (
      this.options &&
      this.options.code &&
      this.options.code.showPlaywrightFirst
    ) {
      this.activeTab = TYPE.PLAYWRIGHT
      this.tabs = this.tabs.reverse()
    }
    this.$emit('update:tab', this.activeTab)
  },
  methods: {
    code() {
      return this.activeTab === TYPE.PUPPETEER
        ? this.puppeteer
        : this.playwright
    },
    changeTab(tab) {
      this.activeTab = tab
      this.$emit('update:tab', tab)
    },
  },
}
</script>
