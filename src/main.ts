import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'normalize.css'
import fontawesome from './plugins/fontawesome'
import vant from './plugins/vant'
import './assets/style/theme.less'
import './assets/style/reset.less'
import axios from './plugins/axios'
import moment from 'moment'
moment.locale('zh-cn')
import 'animate.css'

const vue = createApp(App)

vue.use(vant)
vue.use(fontawesome)
vue.use(axios)

/**自定义指令-长按事件 */
vue.directive('longpress',{
    mounted(el:HTMLElement,binding){
        let timeOutEvent = 0 //记录触摸时长
        el.addEventListener('touchstart',function(){
            clearTimeout(timeOutEvent);
            timeOutEvent = setTimeout(function() {
                timeOutEvent = 0;
                //  处理长按事件...
                binding.value(binding.arg)
            }, 600);
        })
    
        el.addEventListener('touchend',()=>{
            clearTimeout(timeOutEvent);
        })
        
    }
})


vue.use(router).mount('#app')
