import { DictionaryNames } from "@/config"

export type FilterKeys = Exclude<DictionaryNames,'folder'>
export interface IConditionForHomeList {
    folder:number | null,
    filters:{type:FilterKeys,values:number[]}[],
    searchText:string,
    sort:{
        medical_history_date:sortOptions
    }
}

type sortOptions = 'asc' | 'desc'