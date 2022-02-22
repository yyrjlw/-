<template>
    <van-nav-bar
        :title="id ? '编辑' : '添加' + '病历'"
        left-arrow
        @click-left="router.back()"
        fixed
        placeholder
    >
        <template v-if="id" #right>
            <van-icon name="delete-o" size="18" @click="deleteThis" />
        </template>
    </van-nav-bar>
    <van-form>
        <van-cell-group inset>
            <van-field
                v-model="strOfCheckedTags"
                is-link
                readonly
                name="picker"
                label="标签"
                placeholder="点击选择标签"
                @click="showTagPicker = true"
            />
            <van-field
                v-model="selectedFolder"
                is-link
                readonly
                name="picker"
                label="文件夹"
                placeholder="点击选择文件夹"
                @click="showFolderPicker = true"
            />
            <van-field
                v-model="formatDate"
                is-link
                readonly
                name="picker"
                label="时间"
                placeholder="点击选择时间日期"
                @click="showDatetimePicker = true"
            />
            <van-field
                v-model="formModel.content"
                type="textarea"
                placeholder="这里可以输入内容哦"
                rows="12"
                autosize
            />
        </van-cell-group>
    </van-form>

    <van-cell-group inset class="pictures-group">
        <div
            class="preview-box"
            v-for="item of existsPictures.concat(uploadedPictures)"
            :key="item.fileName"
            @click="ImagePreview([item.base64])"
        >
            <van-image class="img" :src="item.base64" fit="contain" postion="center" />
            <van-icon name="clear" class="del-icon" @click.stop="removeImg(item.fileName)" />
        </div>
    </van-cell-group>

    <div class="fixed-bottom_placeholder">
        <van-row class="fixed-bottom" justify="space-between" align="center">
            <van-col :offset="3">
                <van-uploader :after-read="afterReadImg">
                    <van-icon name="photo" />
                </van-uploader>
            </van-col>
            <van-col span="10">
                <van-button round size="small" block type="primary" @click="onSubmit">提交</van-button>
            </van-col>
        </van-row>
    </div>

    <!-- 标签选择器 -->
    <van-popup v-model:show="showTagPicker" position="bottom" round closeable>
    <van-cell-group inset class="group-tag">
            <van-cell
                v-for="({ id, value, isChecked }, index) in tagColumns"
                clickable
                :key="index"
                :value="value"
                @click="toggle(index)"
                class="cell-tag"
            >
                <template #icon>
                    <van-checkbox :model-value="isChecked" />
                </template>
            </van-cell>
        </van-cell-group>
    </van-popup>

    <!-- 文件夹选择器 -->
    <van-popup v-model:show="showFolderPicker" position="bottom">
        <van-picker
            :columns="folderColumns"
            :columns-field-names="{ text: 'value' }"
            @confirm="onFolderConfirm"
            @cancel="showFolderPicker = false"
        />
    </van-popup>

    <!-- 时间选择器 -->
    <van-popup v-model:show="showDatetimePicker" position="bottom">
        <van-datetime-picker
            v-model="currentDate"
            type="datetime"
            title="选择时间"
            @cancel="showDatetimePicker = false"
            @confirm="changeDatetimePicker"
            :formatter="showTimeFormatter"
        />
    </van-popup>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import moment from 'moment'
import medicalHistoryService from '@/services/MedicalHistoryService'
import { Dialog, Toast } from 'vant'
import { IMedicalRecord } from '@/interface/model/IMedicalRecord'
import { IDictionary } from '@/interface/model/IDictionary'
import dictionaryService from '@/services/DictionaryService'
import { pictureBaseFolder, timeFormat } from '@/config'
import systemService from '@/services/SystemService'
import { IImageFileDetial } from '@/interface/IImageFileDetial'
import { v4 as uuidv4 } from 'uuid'
import { ImagePreview } from 'vant';
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
    id?: number
}>()



const formModel = reactive<Partial<IMedicalRecord>>({
    id: 0,
    folder_id: 0,
    content: '',
    medical_time: moment().format(timeFormat),
    pictures: [],
    tags: []
})

//#region 修改病历：加载病历信息
if (props.id) {
    medicalHistoryService.findOne(props.id)
        .then(result => {
            if (!result) {
                Toast.fail('数据加载失败')
                return;
            }
            Object.assign(formModel, result)
            currentDate.value = new Date(formModel.medical_time!)
            medicalHistoryService.getPicturesByMedicalRecordID(props.id!)
                .then(pics => {
                    for (const i of pics) {
                        systemService.readFile(pictureBaseFolder + i.file_name)
                            .then(base64 => {
                                existsPictures.value.push({
                                    fileName: i.file_name,
                                    base64: 'data:image/*;base64,' + base64
                                })
                            })
                    }
                })
        })
}
//#endregion

//#region 标签选择相关逻辑
const showTagPicker = ref(false)
const tagColumns = ref<(IDictionary & {isChecked?:boolean})[]>([])
const strOfCheckedTags = computed(() => formModel.tags?.map(item => item.value).join(','))
const toggle = (index: number) => {
    const item = tagColumns.value[index];
    item.isChecked=!item.isChecked

    const existsIndex = formModel.tags?.findIndex(i=>i.id===item.id)
    if (item.isChecked&&existsIndex===-1) {
        formModel.tags!.push(tagColumns.value[index])
    }else if(!item.isChecked&&existsIndex!==-1){
        formModel.tags!.splice(existsIndex!,1)
    }
}
//修改病历：已选择标签
const stop_watch = watch(()=>[[tagColumns.value],formModel.tags],newVal=>{
    if (newVal[0]?.length&&newVal[1]?.length) {
        for (const tag of formModel.tags!) {
            const index = tagColumns.value.findIndex(i=>i.id===tag.id)
            if (index!=-1) {
                tagColumns.value[index].isChecked=true
            }
        }
        stop_watch()
    }
},{deep:true})

//获取所有标签
dictionaryService.findByName('tag')
.then(columns=>{
    if (Array.isArray(columns)) tagColumns.value = columns
})
//#endregion

//#region 时间选择相关逻辑
const showDatetimePicker = ref(false)
const currentDate = ref<Date | undefined>(new Date())
const formatDate = computed(() => formModel.medical_time ? moment(formModel.medical_time).format('LLL') : '')
/** 选项格式化函数 */
const showTimeFormatter = (type: string, value: any) => {
    if (type === 'year') {
        return `${value}年`
    } else if (type === 'month') {
        return `${value}月`
    } else if (type === 'day') {
        return `${value}日`
    } else if (type === 'hour') {
        return `${value}时`
    } else if (type === 'minute') {
        return `${value}分`
    } else if (type === 'second') {
        return `${value}秒`
    }
    return value
}
const changeDatetimePicker = (newVal: string) => {
    formModel.medical_time = moment(newVal).format(timeFormat)
    showDatetimePicker.value = false
}
//#endregion

//#region 图片处理相关逻辑
const uploadedPictures = ref<IImageFileDetial[]>([])
const existsPictures = ref<IImageFileDetial[]>([])
/**用户选择图片后处理逻辑 */
const afterReadImg = ({ file, content }: any, detail: any) => {
    const temp = file.name.split('.')
    const fileName = uuidv4() + '.' + temp[temp.length - 1]
    uploadedPictures.value.push({
        fileName,
        base64: content
    })
}
const removeImg = (fileName: string) => {
    const actionFun = (list: IImageFileDetial[]) => {
        for (let index = list.length - 1; index >= 0; index--) {
            const element = list[index];
            if (element.fileName === fileName) {
                list.splice(index, 1)
                return true
            }
        }
        return false
    }
    return actionFun(uploadedPictures.value) || actionFun(existsPictures.value)
}
const savePicture = async (file: string, fileName: string) => {
    await systemService.saveFileToDisk(pictureBaseFolder, file, fileName)
    formModel.pictures?.push({
        medical_history_id: props.id ? props.id : 0,
        file_name: fileName
    })
}
/**提交时同步图片表数据和本地图片 */
const disposePictures = async () => {
    //查找将要删除的图片
    if (props.id && formModel.pictures) {
        for (let index = formModel.pictures.length - 1; index >= 0; index--) {
            const item = formModel.pictures[index];
            if (existsPictures.value.findIndex(i => i.fileName === item.file_name) === -1) {
                await systemService.deleteFile(pictureBaseFolder + item.file_name)
                formModel.pictures.splice(index, 1)
            }
        }
    }
    //查找将要添加的图片
    for (const item of uploadedPictures.value) {
        await savePicture(item.base64, item.fileName)
    }
}

//#endregion

//#region 文件夹选择相关逻辑
const showFolderPicker = ref(false)
const folderColumns = ref<IDictionary[]>([])
const selectedFolder = computed(() => folderColumns.value.find(i => i.id === formModel.folder_id)?.value)
const onFolderConfirm = ({ id, name, value }: any) => {
    formModel.folder_id = id
    showFolderPicker.value = false
}
!(async () => {
    let _folderColumns = await dictionaryService.findByName('folder')
    if (Array.isArray(_folderColumns)) folderColumns.value = _folderColumns
    if (!props.id) {
        formModel.folder_id = _folderColumns[0].id
    }
})()
//#endregion

/**删除该病历 */
const deleteThis = () => {
    Dialog.confirm({
        message: '确定删除这个病历吗？'
    })
        .then(async () => {
            await medicalHistoryService.deleteOne(props.id!)
            router.back()
        })
}


/**提交修改 */
const onSubmit = async () => {
    if (!formModel.medical_time) {
        Toast('请选择时间')
        return
    }
    await disposePictures()

    let resultID
    if (props.id) {
        resultID = await medicalHistoryService.update(formModel)
    } else {
        resultID = await medicalHistoryService.addOne(formModel)
    }
    if (resultID) {
        Toast.success((props.id ? '修改' : '添加') + '成功')
        router.go(-1)
    } else {
        Toast.fail((props.id ? '修改' : '添加') + '失败')
    }

}


</script>

<style lang="less" scoped>
.van-form {
    margin-top: 20px;
}

.pictures-group {
    margin-top: 10px;
    padding: 10px;

    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 85.4px;
    gap: 10px;
    .preview-box {
        position: relative;
        .del-icon {
            position: absolute;
            top: 0;
            right: 0;
        }
        .img {
            position: absolute;
            width: 100%;
            height: 100%;
        }
    }
    :deep(.van-uploader__wrapper) {
        flex-wrap: nowrap;
    }
    :deep(.van-uploader__upload) {
        order: -1;
    }
}
.fixed-bottom_placeholder {
    height: 45px;
}
.fixed-bottom {
    position: fixed;
    bottom: 0;
    width: 100%;
    background: #fff;
    border-top: 1px solid #ecf0f1;
    box-sizing: border-box;
    padding: 5px 20px;
    i {
        font-size: 30px;
        color: #7f8c8d;
    }
}

.group-tag {
    padding: 45px 0 10px 0;
    max-height: 40vh;
    overflow-y: auto;
}
.cell-tag {
    width: 45%;
    float: left;
    :deep(.van-cell__value) {
        text-align: right;
    }
}
</style>