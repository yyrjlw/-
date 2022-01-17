<template>
  <van-nav-bar title="标题" left-text="返回" left-arrow>
    <template #left>
      <font-awesome-icon icon="fas fa-bars" />
    </template>
    <template #right>
      <!-- <van-icon name="search" size="18" /> -->
    </template>
  </van-nav-bar>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import HelloWorld from '@/components/HelloWorld.vue'

@Options({
  components: {
    HelloWorld
  }
})
export default class Home extends Vue { }
</script>
