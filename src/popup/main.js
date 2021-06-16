import { createApp } from 'vue'
import VueHighlightJS from 'vue3-highlightjs'

import '@/assets/code.css'
import '@/assets/tailwind.css'

import App from './PopupApp.vue'

createApp(App)
  .use(VueHighlightJS)
  .mount('#app')
