<template>
  <div class="tab results-tab">
    <div class="content">
      <pre v-highlightjs="code" v-if="code"><code class="javascript"></code></pre>
      <pre v-else>
        <code>No code yet...</code>
      </pre>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'ResultsTab',
    props: {
      code: { type: String, default: '' }
    }
  }
</script>
<style lang="scss" scoped>
  @import "~styles/_variables.scss";

  .results-tab {
    .content {
      pre {
        padding: 0 $spacer;
        font-size: 12px;
      }
      .code {
        font-family: Consolas, Monaco, monospace;
        padding: $spacer;
      }
    }
  }
</style>
