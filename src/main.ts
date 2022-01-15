import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import attachVant from './plugins/vant'

const vue = createApp(App)

attachVant(vue)

vue.use(store).use(router).mount('#app')
