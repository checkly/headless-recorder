<template>
  <div class="tab results-tab">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="tabs__action"
        v-bind:class="{ selected: activeTab === tab }"
        @click.prevent="changeTab(tab)"
      >
        <span v-if="tab === 'playwright'">🎭</span>
        <img
          v-if="tab === 'puppeteer'"
          src="@/assets/images/puppeteer.png"
          width="16"
        />
        <span class="tabs__action--text">{{ tab }}</span>
      </button>
    </div>

    <div class="content">
      <pre v-if="code()" v-highlightjs="code()">
        <code class="javascript">
        </code>
      </pre>
      <pre v-else>
        <code>No code yet...</code>
      </pre>
    </div>
  </div>
</template>
<script>
export const TYPE = {
  PUPPETEER: "puppeteer",
  PLAYWRIGHT: "playwright"
};

export default {
  name: "ResultsTab",
  props: {
    puppeteer: {
      type: String,
      default: ""
    },
    playwright: {
      type: String,
      default: ""
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      activeTab: TYPE.PUPPETEER,
      tabs: [TYPE.PUPPETEER, TYPE.PLAYWRIGHT]
    };
  },
  mounted() {
    if (
      this.options &&
      this.options.code &&
      this.options.code.showPlaywrightFirst
    ) {
      this.activeTab = TYPE.PLAYWRIGHT;
      this.tabs = this.tabs.reverse();
    }
    this.$emit("update:tab", this.activeTab);
  },
  methods: {
    code() {
      return this.activeTab === TYPE.PUPPETEER
        ? this.puppeteer
        : this.playwright;
    },
    changeTab(tab) {
      this.activeTab = tab;
      this.$emit("update:tab", tab);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/_variables.scss";

.results-tab {
  .content {
    display: flex;
    flex-direction: column;
    height: 100%;
    .generated-code {
      flex: 1;
      height: 100%;
      overflow: auto;
      display: flex;
      flex-direction: column-reverse;
      max-height: $max-content-height;
    }

    pre {
      padding: 0 $spacer;
      font-size: 12px;
      white-space: pre-wrap;
    }
    code {
      font-family: Consolas, Monaco, monospace;
      padding: $spacer;
    }
  }
}

.tabs {
  display: flex;
  border-bottom: 1px solid $gray-lighter;
  &__action {
    padding: 12px 20px;
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    color: $gray-dark;
    outline: none;
    border-bottom: 4px solid transparent;
    text-transform: capitalize;
    display: flex;
    align-items: center;
    &--text {
      margin-left: 10px;
    }
    &.selected {
      border-bottom-color: $blue;
    }
  }
}

.hljs {
  background: #011627;
  color: #d6deeb;
}

/* General Purpose */
.hljs-keyword {
  color: #c792ea;
  font-style: italic;
}
.hljs-built_in {
  color: #addb67;
  font-style: italic;
}
.hljs-type {
  color: #82aaff;
}
.hljs-literal {
  color: #ff5874;
}
.hljs-number {
  color: #f78c6c;
}
.hljs-regexp {
  color: #5ca7e4;
}
.hljs-string {
  color: #ecc48d;
}
.hljs-subst {
  color: #d3423e;
}
.hljs-symbol {
  color: #82aaff;
}
.hljs-class {
  color: #ffcb8b;
}
.hljs-function {
  color: #82aaff;
}
.hljs-title {
  color: #dcdcaa;
  font-style: italic;
}
.hljs-params {
  color: #7fdbca;
}

/* Meta */
.hljs-comment {
  color: #637777;
  font-style: italic;
}
.hljs-doctag {
  color: #7fdbca;
}
.hljs-meta {
  color: #82aaff;
}
.hljs-meta-keyword {
  color: #82aaff;
}
.hljs-meta-string {
  color: #ecc48d;
}

/* Tags, attributes, config */
.hljs-section {
  color: #82b1ff;
}
.hljs-tag,
.hljs-name {
  color: #7fdbca;
}
.hljs-attr {
  color: #7fdbca;
}
.hljs-attribute {
  color: #80cbc4;
}
.hljs-variable {
  color: #addb67;
}

/* Markup */
.hljs-bullet {
  color: #d9f5dd;
}
.hljs-code {
  color: #80cbc4;
}
.hljs-emphasis {
  color: #c792ea;
  font-style: italic;
}
.hljs-strong {
  color: #addb67;
  font-weight: bold;
}
.hljs-formula {
  color: #c792ea;
}
.hljs-link {
  color: #ff869a;
}
.hljs-quote {
  color: #697098;
  font-style: italic;
}

/* CSS */
.hljs-selector-tag {
  color: #ff6363;
}

.hljs-selector-id {
  color: #fad430;
}

.hljs-selector-class {
  color: #addb67;
  font-style: italic;
}

.hljs-selector-attr,
.hljs-selector-pseudo {
  color: #c792ea;
  font-style: italic;
}

/* Templates */
.hljs-template-tag {
  color: #c792ea;
}
.hljs-template-variable {
  color: #addb67;
}

/* diff */
.hljs-addition {
  color: #addb67ff;
  font-style: italic;
}

.hljs-deletion {
  color: #ef535090;
  font-style: italic;
}
</style>
