
import { App } from '@vue/runtime-core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faBars)

export default {
  attach (vue: App): void {
    vue.component('font-awesome-icon', FontAwesomeIcon)
  }
}
