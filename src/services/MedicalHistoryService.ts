import { IMedicalHistoryPictures } from '@/interface/model/IMedicalHistoryPictures'
import { IMedicalRecord } from '@/interface/model/IMedicalRecord'
import { query, querySingle, excute } from '@/utils/sql-util'
import SQL from 'sql-template-strings'
import systemService from '@/services/SystemService'
import { pictureBaseFolder } from '@/config'
import { IConditionForHomeList } from '@/interface/IConditionForHomeList'

class MedicalHistoryService {

    async findOne(id: number): Promise<Partial<IMedicalRecord> | null> {
        const result: Partial<IMedicalRecord> = {}
        const medical_history = await querySingle(SQL`SELECT id, folder_id, content,medical_time FROM medical_history WHERE id = ${id} LIMIT 1`)
        Object.assign(result, medical_history)
        if (medical_history) {
            //获取图片
            result.pictures = await query(SQL`SELECT id, medical_history_id, file_name FROM medical_history_pictures WHERE medical_history_id=${id}`)
            //获取标签
            result.tags = await this.getTags(id)

            return result
        }
        return null
    }

    async getAllWithPagination(currentPage:number,pageSize:number,condition:IConditionForHomeList){
        let sqlSelect = `SELECT 
            mh.id,
            mh.content,
            (SELECT group_concat(tb_pic.file_name) FROM medical_history_pictures tb_pic WHERE tb_pic.medical_history_id=mh.id) AS pictures_str,
            medical_time `
            let sqlWhere = `FROM medical_history mh WHERE 1=1 `
        if (condition.folder!==null) {
            sqlWhere+=`AND mh.folder_id = ${condition.folder}`
        }
        if (condition.searchText!=='') {
            sqlWhere+=`AND mh.content LIKE '%${condition.searchText}%'`
        }
        if (condition.filters.length) {
            for (const item of condition.filters) {
                if (item.type==='tag'&&item.values.length) {
                    sqlWhere+=` AND mh.id IN (SELECT mh_tags.medical_history_id FROM medical_history_tags mh_tags WHERE mh_tags.dic_id IN (${item.values.join()}))`
                }
            }
        }

        if(condition.sort.medical_history_date)
            sqlWhere+=` order by mh.medical_time ${condition.sort.medical_history_date}`

        const list = await query(sqlSelect+sqlWhere+` LIMIT ${pageSize} OFFSET ${(currentPage-1)*pageSize}`) as IMedicalRecord[]
        const {totalCount} = await querySingle(SQL`SELECT COUNT(1) totalCount `.append(sqlWhere)) as {totalCount:number}
        return {
            list,
            totalCount
        }
    }

    async addPictures(pictures: Partial<IMedicalHistoryPictures>[]) {
        let sqlForpictures = SQL`INSERT INTO medical_history_pictures(medical_history_id,file_name)VALUES`
        for (let index = 0; index < pictures.length; index++) {
            const item = pictures[index];
            sqlForpictures.append(SQL`(${item.medical_history_id},${item.file_name})`)
            if (index < pictures.length - 1)
                sqlForpictures.append(',')
        }
        const {rowsAffected} = await excute(sqlForpictures)
        return rowsAffected
    }

    async addOne(entity: Partial<IMedicalRecord>) {
        let { insertId } = await excute(SQL`INSERT INTO medical_history(folder_id,content,medical_time) VALUES(${entity.folder_id},${entity.content},${entity.medical_time})`)
        if (insertId) {
            if (entity.pictures?.length) {
                for (const item of entity.pictures) 
                    item.medical_history_id=insertId
                await this.addPictures(entity.pictures)
            }
            if (entity.tags?.length) {
                await this.addTags(insertId,entity.tags.map(i=>i.id!))
            }
            return insertId
        }
        return null
    }

    async update(entity: Partial<IMedicalRecord>) {
        if (!entity.id) return null
        let { rowsAffected } = await excute(SQL`UPDATE medical_history SET folder_id=${entity.folder_id},content=${entity.content},medical_time=${entity.medical_time} WHERE id=${entity.id}`)
        if (rowsAffected) {
            await excute(SQL`DELETE FROM medical_history_pictures WHERE medical_history_id=${entity.id}`)
            if (entity.pictures?.length) {
                await this.addPictures(entity.pictures)
            }
            await excute(`DELETE FROM medical_history_tags WHERE medical_history_id=${entity.id}`)
            if (entity.tags?.length) {
                await this.addTags(entity.id,entity.tags.map(i=>i.id!))
            }
        }
        return rowsAffected
    }

    getPicturesByMedicalRecordID(id:number):Promise<{file_name:string}[]>{
        return query(SQL`SELECT file_name FROM medical_history_pictures WHERE medical_history_id=${id}`)
    }

    async getCountByFolder(folderID:number):Promise<{folder_id:number,count:number}|null>{
        return querySingle(SQL`SELECT mh.folder_id,COUNT(1) AS count FROM medical_history mh WHERE mh.folder_id=${folderID} GROUP BY mh.folder_id`)
    }

    async getAllCount():Promise<{count:number|null}>{
        return querySingle(SQL`SELECT COUNT(1) AS count FROM medical_history mh`)
    }

    async deleteOne(id:number){
        const {rowsAffected} = await excute(`DELETE FROM medical_history WHERE id = ${id}`)
        if (rowsAffected) {
            const pics = await this.getPicturesByMedicalRecordID(id)
            for (const {file_name} of pics) {
                systemService.deleteFile(pictureBaseFolder+file_name)
            }
        }
    }

    getTags(id:number):Promise<{id:number,value:string}[]>{
        return query(`SELECT id,value FROM dictionary WHERE id IN (SELECT dic_id FROM medical_history_tags WHERE medical_history_id=${id}) AND enable=1`)
    }

    addTags(id:number,dicIds:number[]){
        if (dicIds.length<=0) return
        let sql = "INSERT INTO medical_history_tags(medical_history_id,dic_id) VALUES";
        for (const dic_id of dicIds) {
            sql+=`(${id},${dic_id}),`
        }
        sql = sql.substring(0,sql.length-1)
        return excute(sql)
    }

    

    async getCountByTag(tagID:number):Promise<{count:number|null}>{
        return querySingle(SQL`SELECT COUNT(1) AS count FROM medical_history_tags mhtags WHERE mhtags.dic_id=${tagID}`)
    }
}

export default new MedicalHistoryService()