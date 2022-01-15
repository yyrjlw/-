import { App } from '@vue/runtime-core'
import {
  NavBar,
  NumberKeyboard
} from 'vant'

export default function (vue: App): void {
  vue.use(NavBar)
  vue.use(NumberKeyboard)
}
