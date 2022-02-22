import { App } from 'vue'
import axios from 'axios'

export const $http = axios.create()

export default {
  install (vue: App): void {
    vue.config.globalProperties.$http = $http
  }
}
