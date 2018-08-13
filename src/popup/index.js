import Vue from 'vue'
import VueHighlightJS from 'vue-highlightjs'
import VueClipboard from 'vue-clipboard2'
import App from './components/App.vue'
import './style.scss'

Vue.config.productionTip = false
Vue.use(VueHighlightJS)
Vue.use(VueClipboard)

/* eslint-disable no-new */
new Vue({
  el: '#root',
  render: h => h(App)
})
