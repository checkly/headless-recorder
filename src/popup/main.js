import { createApp } from 'vue'
import VueHighlightJS from 'vue3-highlightjs'

import 'highlight.js/styles/a11y-dark.css'
import '@/assets/tailwind.css'

import App from './PopupApp.vue'

createApp(App)
  .use(VueHighlightJS)
  .mount('#app')
