import { createApp } from 'vue'
import App from './App.vue'
import './assets/css/main.scss'
import { BootstrapVue3, BIcon, BIconPersonFill, BIconSearch } from 'bootstrap-vue-3'
import VueNativeSock from 'vue-native-websocket-vue3'
import router from './router'
import store from './store'

const app = createApp(App)

app.use(BootstrapVue3)
app.component('b-icon', BIcon)
app.component('BIcon', BIcon)
app.component('BIconPersonFill', BIconPersonFill)
app.component('BIconSearch', BIconSearch)

const urlws =
  (window.location.protocol === 'https:' ? 'wss' : 'ws') +
  '://' +
  (process.env.VUE_APP_SERVICE_HOST || window.location.hostname) +
  ':' +
  (process.env.VUE_APP_SERVICE_PORT || window.location.port) +
  '/notification/ws'

app.use(VueNativeSock, urlws, {
  format: 'json',
  reconnection: true,
  reconnectionAttempts: 10000,
  reconnectionDelay: 1000,
  store,
})

app.use(router)
app.use(store)
app.mount('#app')
