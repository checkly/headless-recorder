import Vue from 'vue'
import App from './components/App.vue'
import '../styles/style.scss'

Vue.config.productionTip = false

Vue.prototype.$chrome = chrome

/* eslint-disable no-new */
new Vue({
  el: '#root',
  render: h => h(App)
})
