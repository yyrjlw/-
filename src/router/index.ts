import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import { App as capacitorApp } from '@capacitor/app';
import { Toast } from 'vant';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta:{
      keepAlive:true
    }
  },
  {
    path: '/updateMedical/:id?',
    name: 'UpdateMedical',
    component: () => import('../views/UpdateMedical.vue'),
    props:true
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  },
  {
    path: '/tagManage',
    name: 'TagManage',
    component: () => import('../views/TagManage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

const confirmExit = (() =>{
  let lastClickTime:Date | undefined
  return ()=>{
    const waitTime = 700
    
    if (!lastClickTime || new Date().getTime() - lastClickTime.getTime()>waitTime) {
      Toast('再按一次退出程序')
    }else{
      capacitorApp.exitApp()
    }
    lastClickTime = new Date()
  }
})()

capacitorApp.addListener('backButton',()=>{
  if (router.currentRoute.value.name==='Home') {
    confirmExit()
  }else{
    router.back()
  }
})

export default router
