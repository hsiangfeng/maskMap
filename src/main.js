import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueGeolocation from 'vue-browser-geolocation';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

Vue.use(VueAxios, axios)
Vue.use(VueGeolocation);
Vue.component('Loading', Loading)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
