<template>
  <van-nav-bar title="标签管理" left-arrow @click-left="router.back()" fixed placeholder></van-nav-bar>

  <van-cell-group>
    <van-cell v-for="(item, index) of tagList" :key="index" :title="item.value">
      <template #value>
        <van-button type="warning" size="mini" @click.native="showUpdateTag=true,tagIDOfUpdate=item.id,tagNameOfUpdate=item.value">修改</van-button>
        <van-button type="danger" size="mini" @click.native="deleteHandle(item.id,item.value)">删除</van-button>
      </template>
    </van-cell>
  </van-cell-group>

  <div class="btn-container">
    <van-button plain hairline round size="small" block type="primary" @click.native="showUpdateTag=true;tagNameOfUpdate=''">新增标签</van-button>
  </div>

  <van-dialog v-model:show="showUpdateTag" :title="(tagNameOfUpdate?'修改':'新增')+'标签'" show-cancel-button :before-close="updateHandle">
    <van-field v-model="tagNameOfUpdate" label="标签名称" placeholder="请输入标签名称" ref="tagNameOfUpdate_field" />
  </van-dialog>
</template>

<script setup lang="ts">
import { IDictionary } from '@/interface/model/IDictionary';
import dictionaryService from '@/services/DictionaryService';
import medicalHistoryService from '@/services/MedicalHistoryService';
import { Dialog, Toast } from 'vant';
import { computed, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

//#region 初始化
const tagList = ref<IDictionary[]>([])

const onLoad = ()=>{
  Toast.loading('加载中...')
  dictionaryService.findByName('tag')
    .then(tags => {tagList.value=tags;Toast.clear()})
}
onLoad()
//#endregion

const deleteHandle = async (id:number,name:string) =>{
  await Dialog.confirm({
    message:`确定删除标签《${name}》?`
  })
  const {count} = await medicalHistoryService.getCountByTag(id)
  if (count) {
    Dialog.alert({
      title:'提示',
      message:'该标签下还有病历记录，您必须先删除这些病历记录才能删除该标签'
    })
  }else{
    await dictionaryService.delByID(id)
    onLoad()
  }
}

//#region 新增/修改
const _showUpdateTag = ref(false)
const tagNameOfUpdate_field = ref()
const showUpdateTag=computed({
  get(){
    return _showUpdateTag.value
  },
  set(val:boolean){
    _showUpdateTag.value=val
    if(val) nextTick(()=>tagNameOfUpdate_field.value.focus())
  }
})

const tagNameOfUpdate = ref('')
const tagIDOfUpdate = ref<number | undefined>()
const updateHandle = async (action: string) =>{
  if(action!=='confirm')return true;
  
  tagNameOfUpdate.value=tagNameOfUpdate.value.trim()
  if (tagNameOfUpdate.value) {
    if (tagIDOfUpdate.value) {
      dictionaryService.updateOne(tagIDOfUpdate.value,tagNameOfUpdate.value)
      tagIDOfUpdate.value=undefined
    }else{
      await dictionaryService.addOne('tag',tagNameOfUpdate.value)
    }
    onLoad()

    return true
  }else{
    Toast({
      message:'你好歹写点东西啊喂',
      className:'animate__animated animate__tada'
    });
    return false
  }
}
//#endregion

</script>

<style scoped lang="less">
:deep(.van-cell__value) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.btn-container{
  padding: 0 50px;
  margin-top: 10px;
}
</style>
