import { App } from '@vue/runtime-core'
import {
  NavBar,
  Icon
} from 'vant'

export default {
  attach (vue: App): void {
    vue.use(NavBar)
    vue.use(Icon)
  }
}
