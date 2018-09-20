import Vue from 'vue'
import VueHighlightJS from 'vue-highlightjs'
import VueClipboard from 'vue-clipboard2'
import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'
import App from './components/App.vue'
import '../styles/style.scss'

Vue.config.productionTip = false
const apolloProvider = new VueApollo({
  defaultClient: new ApolloClient({
    uri: 'http://127.0.0.1:5000/graphql'
  })
})
Vue.use(VueHighlightJS)
Vue.use(VueClipboard)
Vue.use(VueApollo)

Vue.prototype.$chrome = chrome

/* eslint-disable no-new */
window.root = new Vue({
  apolloProvider,
  el: '#root',
  render: h => h(App)
})
