import Vue from 'vue'
import VueHighlightJS from 'vue-highlightjs'
import VueClipboard from 'vue-clipboard2'
import App from './components/App.vue'
import * as gaSource from './ga'
import '../styles/style.scss'

// GA settings

// eslint-disable-next-line no-unexpected-multiline
(function () {
  const ga = document.createElement('script')
  ga.type = 'text/javascript'; ga.async = true
  ga.src = gaSource
  const s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s)
})()

// eslint-disable-next-line no-use-before-define
window._gaq = window._gaq || []
// eslint-disable-next-line func-call-spacing
window._gaq.push(['_setAccount', 'UA-110523681-4'])

Vue.config.productionTip = false
Vue.use(VueHighlightJS)
Vue.use(VueClipboard)

Vue.prototype.$chrome = chrome

/* eslint-disable no-new */
new Vue({
  el: '#root',
  render: h => h(App)
})
