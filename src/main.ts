import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import 'normalize.css'
import vant from './plugins/vant'
import fontawesome from './plugins/fontawesome'

const vue = createApp(App)

vant.attach(vue)
fontawesome.attach(vue)

vue.use(store).use(router).mount('#app')
