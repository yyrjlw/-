import { IBase } from "./IBase";
import { IDictionary } from "./IDictionary";
import { IMedicalHistoryPictures } from "./IMedicalHistoryPictures";

export interface IMedicalRecord extends IBase{
    folder_id:number
    content:string
    medical_time:string

    pictures:Partial<IMedicalHistoryPictures>[]
    pictures_str:string
    pictures_base64_arr:string[]
    tags:Partial<IDictionary>[]
}