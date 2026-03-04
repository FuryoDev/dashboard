import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue';
import App from './App.vue'
import store from './store'
import './assets/css/main.scss';
import router from './router'

Vue.config.productionTip = false
Vue.use(BootstrapVue);

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
