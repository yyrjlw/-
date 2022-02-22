<template>
  <div class="bar_placeholder">
    <van-nav-bar :title="currentFolderName" fixed v-show="!showSearchForm">
      <template #left>
        <font-awesome-icon icon="bars" size="lg" @click="showSidebar = true" />
      </template>
      <template #right>
        <van-icon name="search" size="18" @click="showSearchForm = true" />
      </template>
    </van-nav-bar>

    <div class="search-content" v-show="showSearchForm">
      <input
        type="text"
        class="search-text"
        placeholder="搜索"
        v-model="pagenation.condition.searchText"
        @input="searchHandle()"
      />
      <van-icon name="close" @click="showSearchForm = false" />
    </div>
  </div>

  <div class="filter-container">
    <template v-for="(item,index) of filterOptions" :key="item.name">
      <van-badge :dot="item.showbadge">
        <span class="filter-option" :class="{active:activeFilterOptionIndex===index&&showDynamicFilterAction}" @click="toggleFilterActions(index)">
          {{ item.name }}
          <van-icon name="arrow-down" v-show="!showDynamicFilterAction" />
          <van-icon name="arrow-up" v-show="showDynamicFilterAction" />
        </span>
      </van-badge>
    </template>

    <div class="actions-container" v-show="showDynamicFilterAction">

      <van-grid :border="false" :column-num="2">
        <van-grid-item v-for="action of dynamicFilterActions" :key="action.id">
          <span class="icon">
            <van-icon name="success" v-show="action.selected" />
          </span>
          <span @click="toggleSelecteAction(action.id)">{{action.value}}</span>
        </van-grid-item>
      </van-grid>

      <van-row class="btn-group">
        <van-col span="12" @click="resetFilterHandle">重置</van-col>
        <van-col span="12" @click="confirmFilterHandle">确定</van-col>
      </van-row>
    </div>
      <van-overlay :show="showDynamicFilterAction" @click="showDynamicFilterAction=false" />
  </div>

  <div class="sort-container">
    <div class="total">总数:{{ pagenation.totalCount }}</div>
    <div class="sort">
      <span
        class="txt"
        :class="{ active: pagenation.condition.sort.medical_history_date == 'asc' }"
        @click="pagenation.condition.sort.medical_history_date = 'asc'"
      >最早病程置顶</span>
      <span class="decollator">/</span>
      <span
        class="txt"
        :class="{ active: pagenation.condition.sort.medical_history_date == 'desc' }"
        @click="pagenation.condition.sort.medical_history_date = 'desc'"
      >近期病程置顶</span>
    </div>
  </div>

  <van-list
    v-model:loading="pagenation.loading"
    :finished="pagenation.finished"
    finished-text="没了，就这些"
    @load="onLoadData"
    :immediate-check="false"
  >
    <div class="medical_card" v-for="(item, index) in pagenation.list" :key="item.id">
      <span class="router-push" @click="router.push('/updateMedical/' + item.id)">
        <div class="left">
          <div class="tags">
            <van-tag
              round
              type="primary"
              plain
              v-for="(tag, index) of item.tags"
              :key="index"
            >{{ tag.value }}</van-tag>
          </div>
          <div class="medical-content van-multi-ellipsis--l2">{{ item.content }}</div>
        </div>
        <div class="right">
          <span class="time">{{ item.medical_time }}</span>
          <van-icon name="arrow" />
        </div>
      </span>
      <div class="bottom img-list">
        <van-image
          v-if="item.pictures_base64_arr"
          v-for="(base64, index) of item.pictures_base64_arr"
          :key="index"
          width="124"
          height="100"
          :src="base64"
          fit="cover"
          postion="center"
          @click="ImagePreview([base64])"
        />
      </div>
      <van-divider v-if="index != pagenation.list.length - 1" />
    </div>
  </van-list>

  <div class="tools">
    <van-icon name="add" id="add-medical" @click="router.push('UpdateMedical')" />
  </div>

  <!-- 侧边菜单 -->
  <van-popup v-model:show="showSidebar" position="left" class="popup-sidebar">
    <div class="logo">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-bingli" />
      </svg>
    </div>
    <van-collapse v-model="collapseActiveName">
      <van-collapse-item name="1">
        <template #title>
          <span>
            文件夹
            <span style="font-size: 8px;color: #bdc3c7;padding-left: 20px;">长按文件夹名可以更改名字哦</span>
          </span>
        </template>
        <van-cell
          title="全部"
          :value="'数量：' + allDataCount"
          class="folder-item all-data"
          :class="{ activated: pagenation.condition.folder === null }"
          @click="changeActiveFolder()"
        >
          <template #icon>
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-xianshisuoyoujilu" />
            </svg>
          </template>
        </van-cell>

        <van-cell
          v-for="item of folders"
          :key="item.id"
          :title="item.value"
          :value="'数量：' + item.mediCount"
          class="folder-item"
          :class="{ activated: pagenation.condition.folder === item.id }"
          v-longpress:[item.id]="changeFolderName"
          @click="changeActiveFolder(item.id)"
        >
          <template #icon>
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-folder-01" />
            </svg>
          </template>
          <template #right-icon>
            <van-icon name="clear" class="folder-del" @click.stop="delFolder(item.id)" />
          </template>
        </van-cell>

        <van-button
          plain
          hairline
          round
          size="small"
          block
          type="primary"
          @click="showAddOrChangeFolderDialog = true; updateModelOfFolder = 1"
        >新增文件夹</van-button>
      </van-collapse-item>
    </van-collapse>
    <van-icon name="setting" class="setting" @click="router.push('/settings')" />
  </van-popup>

  <!-- 添加\修改文件夹弹窗 -->
  <van-dialog
    v-model:show="showAddOrChangeFolderDialog"
    :title="(updateModelOfFolder == 1 ? '新增' : '修改') + '文件夹'"
    show-cancel-button
    :before-close="onConfirmForAddFolder"
  >
    <van-field
      v-model="FolderNameField"
      label="文件夹"
      placeholder="请输入文件夹名称"
      :error-message="errorMsgForAddfield"
    />
  </van-dialog>
</template>


<script setup lang="ts">
import { IMedicalRecord } from '@/interface/model/IMedicalRecord'
import { computed, onActivated, reactive, ref, watch } from 'vue'
import store from '@/store-mini'
import medicalHistoryService from '@/services/MedicalHistoryService'
import { pictureBaseFolder } from '@/config/index'
import systemService from '@/services/SystemService'
import { Dialog, ImagePreview, Toast } from 'vant'
import dictionaryService from '@/services/DictionaryService'
import { IDictionary } from '@/interface/model/IDictionary'
import { debounce } from 'lodash'
import { FilterKeys, IConditionForHomeList } from '@/interface/IConditionForHomeList'
import { useRouter } from 'vue-router'

const router = useRouter()

//#region 数据加载
const pagenation = reactive({
  currentPage: 1,
  pageSize: 5,
  totalCount: 0,
  loading: false,
  finished: false,
  list: [] as IMedicalRecord[],
  condition: {
    folder: null,
    filters: [],
    searchText: '',
    sort: {
      medical_history_date: 'asc'
    }
  } as IConditionForHomeList
})

/** 异步加载图片、标签 */
watch(() => pagenation.list.length, (newVal, oldVal) => {
  if (newVal) {
    for (let index = oldVal; index < newVal; index++) {
      const item = pagenation.list[index];
      const pic_arr = item.pictures_str?.split(',')
      if (pic_arr) {
        for (const picName of pic_arr) {
          systemService.readFile(pictureBaseFolder + picName)
            .then(base64 => {
              if (!item.pictures_base64_arr)
                item.pictures_base64_arr = []
              item.pictures_base64_arr.push('data:image/*;base64,' + base64)
            })
        }
      }
      medicalHistoryService.getTags(item.id)
        .then(data => item.tags = data)
    }
  }
})

/**从数据库获取数据 */
const onLoadData = async () => {
  pagenation.loading = true
  const data = await medicalHistoryService.getAllWithPagination(pagenation.currentPage++, pagenation.pageSize, pagenation.condition)

  pagenation.list.push(...data.list)
  pagenation.totalCount = data.totalCount

  if (pagenation.currentPage > Math.ceil(pagenation.totalCount / pagenation.pageSize)) {
    pagenation.finished = true
  }
  pagenation.loading = false
}


/** 重置页面数据，重新加载 */
const resetPagenation = () => {
  pagenation.list = []
  pagenation.currentPage = 1
  pagenation.finished = false
  onLoadData()
}

/**排序改变，加载数据 */
watch(() => pagenation.condition.sort, resetPagenation, { deep: true })


store.addObserver({
  stateName: 'initialized',
  update: resetPagenation
})

/**页面从缓存状态激活时 */
onActivated(resetPagenation)

//#endregion

//#region 侧边菜单
const showSidebar = ref(false)
const collapseActiveName = ref(['1'])


/**页面从缓存状态激活时 */
onActivated(()=>showSidebar.value=false)

  //#region 文件夹
type folderWithDetail = IDictionary & { mediCount: number }
/** 所有文件夹集合 */
const folders = ref<folderWithDetail[]>([])
/** 所有记录总数 */
const allDataCount = ref<number>()
const getCountByFolder = () => {
  for (const item of folders.value) {
    medicalHistoryService.getCountByFolder(item.id)
      .then(data => item.mediCount = data?.count ?? 0)
  }
}
/**获取所有文件夹及旗下记录数量 */
const getFoldersWithDataCount = async () => {
  medicalHistoryService.getAllCount()
    .then(data => allDataCount.value = data?.count ?? 0)
  let _folders = await dictionaryService.findByName('folder') as folderWithDetail[]
  folders.value = _folders
  getCountByFolder()
}
store.addObserver({
  stateName: 'initialized',
  update: getFoldersWithDataCount
})

/**删除文件夹函数 */
const delFolder = async (filderID: number) => {
  if (folders.value.length == 1) {
    Toast.fail('您应该至少保留一个文件夹')
    return;
  }
  const index = folders.value.findIndex(i => i.id === filderID)
  if (folders.value[index].mediCount) {
    try {
      await Dialog.confirm({
        message: '该文件夹下还有记录，是否删除该文件夹？(PS:记录不会删除)'
      })
    } catch (error) {
      return;
    }
  } else {
    try {
      await Dialog.confirm({
        message: '确定删除该文件夹？'
      })
    } catch (error) {
      return;
    }
  }

  const { rowsAffected } = await dictionaryService.delByID(filderID)
  if (rowsAffected) folders.value.splice(index, 1)
}

/**显示\隐藏 新增\修改文件夹弹窗 */
const showAddOrChangeFolderDialog = ref(false)
/** 新增\修改文件夹 名称 */
const FolderNameField = ref('')
/**错误消息提示 */
const errorMsgForAddfield = ref('')
/**操作模式：1新增 OR 2修改 */
const updateModelOfFolder = ref<1 | 2>()
const modifyFolderID = ref(0)
/**新增\修改文件夹确认函数 */
const onConfirmForAddFolder = async (action: string) => {
  if (action === 'confirm') {
    if (!FolderNameField.value.trim()) {
      errorMsgForAddfield.value = '文件夹名称不可为空'
      return false
    }
    if (updateModelOfFolder.value === 1)
      await dictionaryService.addOne('folder', FolderNameField.value)
    else
      await dictionaryService.updateOne(modifyFolderID.value, FolderNameField.value)
    showAddOrChangeFolderDialog.value = false
    getFoldersWithDataCount()
  }
  FolderNameField.value = '';
  return true
}

/** 用户单击文件夹 */
const changeActiveFolder = (folderID: number | null = null) => {
  pagenation.condition.folder = folderID
  resetPagenation()
  showSidebar.value = false
}
/**更改文件夹名称 入口函数 */
const changeFolderName = (id: number) => {
  modifyFolderID.value = id
  FolderNameField.value = folders.value.find(i => i.id === id)!.value

  updateModelOfFolder.value = 2
  showAddOrChangeFolderDialog.value = true
}

const currentFolderName = computed(() => folders.value.find(i => i.id === pagenation.condition.folder)?.value ?? "全部病历")

  //#endregion

//#endregion

//#region 搜索
const showSearchForm = ref(false)
const searchHandle = debounce(resetPagenation, 500)

//#endregion

//#region 顶部筛选

/**所有的筛选条件+内容 */
const filterOptions = ref<{
  type: FilterKeys,
  name: string,
  showPopover: boolean,
  showbadge:boolean,
  actions: IDictionary[]
}[]>([])
const initFilterOptions = async () => {
  const value = await dictionaryService.findByName('tag')
  if (value.length) {
    filterOptions.value=[{
      type: 'tag',
      name: '标签',
      showPopover: false,
      showbadge:false,
      actions: value
    }]
  }
}

store.addObserver({
  stateName: 'initialized',
  update: initFilterOptions
})
/**页面从缓存状态激活时 */
onActivated(initFilterOptions)

/**展开的动态筛选内容列表 */
const dynamicFilterActions = ref<(IDictionary&{selected?:Boolean})[]>([])
/**显示/隐藏 动态筛选内容列表 */
const showDynamicFilterAction = ref(false)
/**当前激活的筛选项 filterOptions数组Index */
const activeFilterOptionIndex = ref<number|undefined>()

/**点击筛选项事件 */
const toggleFilterActions = (index: number) => {
  if (showDynamicFilterAction.value) {
    showDynamicFilterAction.value=false
    activeFilterOptionIndex.value=undefined
  }else{
    dynamicFilterActions.value=filterOptions.value[index].actions
    activeFilterOptionIndex.value=index
    showDynamicFilterAction.value=true
  }
}

/**已选择的筛选条件Map */
const mapOfselectedFilterActions = ref(new Map())
/**选择/取消 筛选内容项 */
const toggleSelecteAction = (id:number) =>{
  const dynamicFilterAction=dynamicFilterActions.value.find(i=>i.id===id)!
  if (mapOfselectedFilterActions.value.has(activeFilterOptionIndex.value)) {
    const actions = mapOfselectedFilterActions.value.get(activeFilterOptionIndex.value) as number[]
    const existsID = actions.findIndex(i=>i===id);
    if (existsID!=-1) {
      actions.splice(existsID,1)
      dynamicFilterAction.selected=false
    }else{
      actions.push(id)
      dynamicFilterAction.selected=true
    }
  }else{
    mapOfselectedFilterActions.value.set(activeFilterOptionIndex.value,[id])
    dynamicFilterAction.selected=true
  }
}

/**重置筛选 */
const resetFilterHandle = () => {
  mapOfselectedFilterActions.value.delete(activeFilterOptionIndex.value)
  dynamicFilterActions.value.forEach(i=>i.selected=false)
  filterOptions.value[activeFilterOptionIndex.value!].showbadge=false

  const pagenationFilter=pagenation.condition.filters.find(i=>i.type===filterOptions.value[activeFilterOptionIndex.value as number].type)
  if (pagenationFilter) {
    pagenationFilter.values=[]
    resetPagenation()
    showDynamicFilterAction.value=false
  }
}

/**提交筛选 */
const confirmFilterHandle = () => {
  pagenation.condition.filters=[]
  mapOfselectedFilterActions.value.forEach((values:number[] , key:number) =>{
    if (values.length) {
      pagenation.condition.filters.push({
        type:filterOptions.value[key].type,
        values
      })
    }
  })
  resetPagenation()

  filterOptions.value[activeFilterOptionIndex.value!].showbadge=dynamicFilterActions.value.some(i=>i.selected)
  showDynamicFilterAction.value=false
}

//#endregion

</script>

<style lang="less" scoped>
.bar_placeholder {
  height: var(--van-nav-bar-height);
  background: var(--van-nav-bar-background-color);
}

//顶部导航栏右侧图标
.van-nav-bar__right > i {
  padding: 0 6.5px;
  &:last-of-type {
    padding-right: 0;
  }
}

//搜索框
.search-content {
  width: 100%;
  height: var(--van-nav-bar-height);
  position: fixed;
  background: var(--van-nav-bar-background-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  .search-text {
    background: transparent;
    background: rgba(236, 240, 241, 0.5);
    border: none;
    border-radius: 50px;
    flex: 1;
    height: 30px;
    text-indent: 1em;
    margin-left: 20px;
    &::placeholder {
      color: rgba(236, 240, 241, 0.7);
    }
  }
  .van-icon {
    padding: 0 10px;
    font-size: 25px;
  }
}

.filter-container {
  background: white;
  padding: 0 10px;
  height: 35px;
  display: flex;
  align-items: center;
  position: relative;
  .filter-option {
    text-align: center;
    padding: 5px 10px;
    border-radius: 50px;
    background: #ecf0f1;
    color: black;
    font-size: 12px;
    margin: 0 5px;

    &.active{
      position: relative;
      z-index: 10;
      &::after{
        content: '';
        position: absolute;
        width: 100%;
        height: 80%;
        background-color: inherit;
        left: 0;
        top: 50%;
        z-index: -1;
      }
    }
  }
  :deep(.van-badge){
    transform: translateX(-9px);
    z-index: 100;
  }
  .actions-container {
    position: absolute;
    top: 35px;
    left: 0;
    background: #ecf0f1;
    @radius: 25px;
    border-radius: 0 0 @radius @radius;
    width: 100%;
    height: 200px;
    z-index: 100;

    .van-grid{
      max-height: 100%;
      overflow-y: auto;
      padding-bottom: 45px;
      box-sizing: border-box;
    }
    :deep(.van-grid-item__content){
      background: none;
      flex-direction: row;
    }

    .icon{
      width: 16px;
      padding: 0 5px;
    }

    .btn-group {
      position: absolute;
      bottom: 15px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      text-align: center;
      color: rgba(255, 255, 255, 1);
      .van-col {
        padding: 6px 0;
        &:first-child {
          border-top-left-radius: 50px;
          border-bottom-left-radius: 50px;
          background: rgba(46, 213, 115, 1);
        }
        &:last-child {
          border-top-right-radius: 50px;
          border-bottom-right-radius: 50px;
          background: rgba(30, 144, 255, 1);
        }
      }
    }
  }
    .van-overlay {
      top: 84px;
    }
}

//排序和总数
.sort-container {
  display: flex;
  justify-content: center;
  font-size: 13px;
  padding: 10px;
  position: relative;

  .total {
    font-size: 11px;
    color: #747d8c;
    position: absolute;
    left: 10px;
    transform: translateY(10%);
  }

  .sort {
    display: flex;
    align-items: center;
    .txt {
      color: #bdc3c7;
      &.active {
        color: #2c3e50;
      }
    }
    .decollator {
      font-weight: bolder;
      color: #f39c12;
      padding: 0 4px;
    }
  }
}

//主要内容区域
.medical_card {
  padding: var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);

  .router-push {
    display: flex;
    @r_width: 10px;
    align-items: center;
    .left {
      flex: 1;
    }
    .right {
      width: @r_width;
    }
  }
}
.medical_card {
  .time {
    font-size: 11px;
    color: #7f8c8d;
    white-space: nowrap;
    margin-left: -6.5em;
  }
  .tags {
    & > .van-tag {
      margin: 1px 2px;
    }
    padding-right: 5em;
  }
  .medical-content {
    padding-top: 10px;
    padding-bottom: 5px;
    color: rgb(105, 105, 105);
  }
  .img-list {
    display: flex;
    overflow-x: auto;
    .van-image {
      flex-shrink: 0;
      display: inline;
      margin: 0 3px;
      & > :deep(img) {
        border-radius: 5px;
      }
    }
  }
}

//底部工具箱
.tools {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  font-size: 60px;
  flex-direction: column;
  > i {
    border-radius: 50%;
    margin: 3px 0;
  }
  //添加记录
  #add-medical {
    color: chocolate;
  }
}
</style>

<style lang="less">
//左侧菜单
.popup-sidebar {
  box-sizing: border-box;
  height: 100%;
  width: 70%;
  .logo {
    height: 200px;
    background: rgba(18, 156, 248, 0.705);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 80px;
  }
  .folder-item {
    align-items: center;
    padding-right: 0;
    &.activated {
      background: #ecf0f1;
      border-radius: 5px;
    }
    .icon {
      font-size: 20px;
    }
    .van-cell__title {
      padding-left: 10px;
    }
    .van-cell__value {
      padding-right: 10px;
      font-size: 12px;
    }
    &.all-data .van-cell__value {
      padding-right: 23px;
    }
    .folder-del {
      font-size: 18px;
      color: #e74c3c;
    }
  }
  .setting{
    position: absolute;
    bottom: 10px;
    left: 10px;
    font-size: 35px;
    color: #7f8c8d;
  }
}

//顶部筛选弹窗
.filter-popup {
  height: 80%;
  width: 70%;
  background: #fff;
  .van-collapse-item__content {
    display: flex;
    flex-wrap: wrap;
  }

  .btn-group {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 95%;
    text-align: center;
    color: rgba(255, 255, 255, 1);
    .van-col {
      padding: 6px 0;
      &:first-child {
        border-top-left-radius: 50px;
        border-bottom-left-radius: 50px;
        background: rgba(46, 213, 115, 1);
      }
      &:last-child {
        border-top-right-radius: 50px;
        border-bottom-right-radius: 50px;
        background: rgba(30, 144, 255, 1);
      }
    }
  }
}
</style>