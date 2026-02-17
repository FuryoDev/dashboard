import Vue from 'vue'
import App from './App.vue'
import './assets/css/main.scss';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import VueNativeSock from 'vue-native-websocket'
import router from './router'
import store from './store'
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.config.productionTip = false

const urlws =
      (window.location.protocol === "https:" ? "wss" : "ws") +
      "://" +
      (process.env.VUE_APP_SERVICE_HOST || window.location.hostname) +
      ":" +
      (process.env.VUE_APP_SERVICE_PORT || window.location.port) +
      "/notification/ws";

Vue.use(VueNativeSock, urlws, {
  format: 'json',
  reconnection: true, // (Boolean) whether to reconnect automatically (false)
  reconnectionAttempts: 10000, // (Number) number of reconnection attempts before giving up (Infinity),
  reconnectionDelay: 1000, // (Number) how long to initially wait before attempting a new (1000)
  store: store
}) 

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
