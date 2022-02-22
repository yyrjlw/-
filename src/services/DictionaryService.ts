import { DictionaryNames } from "@/config";
import { IDictionary } from "@/interface/model/IDictionary";
import { query,excute } from "@/utils/sql-util";
import SQL from "sql-template-strings";

class DictionaryService {
    async findByName(name:DictionaryNames):Promise<IDictionary[]>{
        return await query(SQL`SELECT id,name,value FROM dictionary WHERE name=${name}  AND enable=1`)
    }

    async delByID(id:number,name?:DictionaryNames){
        if (name==='tag') {
            await excute(SQL`DELETE FROM medical_history_tags WHERE dic_id = ${id}`)
        }
        return excute(SQL`DELETE FROM dictionary WHERE id = ${id}`)
    }

    addOne(name:DictionaryNames,value:string){
        return excute(SQL`INSERT INTO dictionary(name,value) VALUES(${name},${value})`)
    }

    updateOne(id:number,value:string){
        return excute(SQL`UPDATE dictionary SET value = ${value} WHERE id = ${id}`)
    }

}

export default new DictionaryService()