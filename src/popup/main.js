import { createApp } from 'vue'
import App from './App.vue'
import VueHighlightJS from 'vue3-highlightjs'
import 'highlight.js/styles/a11y-dark.css'

import '@/assets/tailwind.css'

createApp(App)
  .use(VueHighlightJS)
  .mount('#app')
