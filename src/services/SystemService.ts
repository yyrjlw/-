import { Directory, Filesystem } from '@capacitor/filesystem'

class SystemService{
    readonly actionDirectory=Directory.External

    async saveFileToDisk(basePath:string, file: string, fileName: string) {
        const {uri} =await Filesystem.writeFile({
            path: basePath + fileName,
            data: file,
            directory: this.actionDirectory,
            recursive: true
        })
        return uri
    }

    deleteFile(fullPath:string) {
        console.log(`文件：${fullPath}  将被删除`)
        return Filesystem.deleteFile({
            path:fullPath,
            directory:this.actionDirectory
        })
    }

    readFile(fullPath:string) {
        return Filesystem.readFile({
            path:fullPath,
            directory:this.actionDirectory
        }).then(result=>result.data)
    }
}

export default new SystemService()
