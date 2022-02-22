import store from '@/store-mini'
import { SQLStatement } from 'sql-template-strings'

const excuteToRaw=(queryString: SQLStatement | string):Promise<{tx:any,result:any}>=>{

    const db = store.state.appDB;
    return new Promise((res, rej) => {
        try {
            db?.transaction(ctx => {
                console.group()
                let _queryString = queryString
                if (queryString instanceof SQLStatement) {
                    _queryString=''
                    if (queryString.sql.includes('?')) {
                        const splitArr=queryString.sql.split('?')
                        for (let index = 0; index < splitArr.length; index++) {
                            const element = splitArr[index];
                            if (index<splitArr.length-1) {
                                _queryString+=element+queryString.values[index]
                            }
                        }
                    }else{
                        _queryString=queryString.sql
                    }
                }
                const consoleStyle='color:#2980b9'
                console.log('%cqueryString='+_queryString,consoleStyle);
                
                let sql=queryString,values=[]
                if (queryString instanceof SQLStatement) {
                    sql=queryString.sql;
                    values=queryString.values;
                }
                ctx.executeSql(sql, values, (tx: any, result: any) => {
                    let resultList = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        resultList.push(result.rows.item(i))
                    }
                    console.log('%cresult='+JSON.stringify({
                        resultList,
                        rowsAffected:result.rowsAffected
                    },null,1),consoleStyle)
                    console.groupEnd()
                    return res({tx,result})
                })
            })
        } catch (error) {
            rej(error)
        }
    })
}

export const excute = (queryString: SQLStatement | string) => excuteToRaw(queryString).then(({tx,result})=>{
    return {
        rowsAffected:result.rowsAffected,
        insertId:result.insertId
    }
})

export const query = (queryString: SQLStatement | string) => excuteToRaw(queryString).then(({tx,result})=>{
    let resultList = [];
    for (let i = 0; i < result.rows.length; i++) {
        resultList.push(result.rows.item(i))
    }
    return resultList
})

export const querySingle = (queryString: SQLStatement | string) => excuteToRaw(queryString).then(({tx,result})=>{
    if (result.rows.length>0) {
        return result.rows.item(0)
    }else{
        return null
    }
})