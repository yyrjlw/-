<template>
  <van-nav-bar title="设置" left-arrow @click-left="router.back()" fixed placeholder></van-nav-bar>

  <van-cell-group>
    <van-cell v-for="(item,index) of menuList" :key="index" :title="item.title" is-link @click.prevent="router.push(item.link)" />
  </van-cell-group>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

const menuList = reactive([
  {
    title:'标签管理',
    link:'/tagManage'
  },
  // {
  //   title:'云备份设置',
  //   link:''
  // }
])
</script>

<style lang="less">

</style>
