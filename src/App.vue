<template>
  <van-dialog
    v-model:show="showUserAgreement"
    title="《隐私政策》和《服务协议》"
    show-cancel-button
    confirm-button-text="同意并继续"
    cancel-button-text="不同意"
    @cancel="App.exitApp()"
    @confirm="confirmUserAgreement()"
  >
    <div v-html="userAgreement?.content" class="userAgreementContent"></div>
  </van-dialog>

  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
    </keep-alive>
    <component :is="Component" :key="$route.name" v-if="!$route.meta.keepAlive" />
  </router-view>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref } from 'vue'
import { Storage } from '@capacitor/storage'
import { APP_CONFIG } from '@/config/keys'
import { IUserAgreement } from './interface/IUserAgreement'
import { IAppConfig } from './interface/IAppConfig'
import { App } from '@capacitor/app'
import store from './store-mini'
import { SQLite } from '@ionic-enterprise/secure-storage'

export default defineComponent({
  setup() {
    const showUserAgreement = ref(false)
    const userAgreement = ref<IUserAgreement>()

    let isFirstOpen = false

    /**打开用户协议 */
    const openUserAgreement = () => {
      showUserAgreement.value = true;
    }

    /**用户同意用户协议 */
    const confirmUserAgreement = async () => {
      //将用户协议版本号存入Storage
      await Storage.set({
        key: APP_CONFIG,
        value: JSON.stringify({
          userAgreementVersion: userAgreement.value!.version
        } as IAppConfig)
      })
      initDB()
    }

    onBeforeMount(async () => {
      // 初始化应用程序
      const data = await import('@/assets/UserAgreement.json')
      
      userAgreement.value = data.default
      //判断是否初次打开应用
      const { value } = await Storage.get({ key: APP_CONFIG })
      if (!value) {
        isFirstOpen = true;
        openUserAgreement()
      } else {
        //判断用户协议是否更新
        let appConfig = JSON.parse(value) as IAppConfig;
        if (appConfig.userAgreementVersion !== userAgreement.value?.version) {
          openUserAgreement()
        }
      }

      if (!showUserAgreement.value) initDB();
    })



    /** 初始化数据库 */
    const initDB = async () => {
      let db = await SQLite.create({
        name: 'medicalrecord.db',
        location: 'default'
      })
      store.setAppDB(db)
      if (isFirstOpen) {
        console.log('isFirstOpen')
        let { default: initDBsql } = await import('@/config/initDB')
        db.sqlBatch([...initDBsql])
      }


      // 初始化应用程序完成 
      store.setInitialized(true)
    }


    return {
      showUserAgreement,
      userAgreement,
      App,
      confirmUserAgreement
    }
  }
})
</script>

<style lang="less">
#app {
  min-height: 100vh;
  background-color: var(--van-background-color);
}
.userAgreementContent {
  height: 300px;
  padding: 10px;
  overflow: auto;
}
//iconfont
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
