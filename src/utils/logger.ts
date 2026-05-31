const logger = {
    info:(message:string , meta?:any)=>{
        console.log(`[INFO] ${new Date().toString()}- ${message}`,meta || "")
    },
    warn:(message:string , meta?:any)=>{
        console.log(`[WARN] ${new Date().toString()}-${message}`, meta || "")
    },
    error:(message:string , meta?:any)=>{
        console.log(`[ERROR] ${new Date().toString()}`,meta || "")
    }
}

export default logger