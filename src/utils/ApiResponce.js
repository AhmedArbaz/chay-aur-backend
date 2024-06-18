class ApiResponce{
    constructor(statusCode,data,message = 'Success'){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode <400 //ya ham dakh lain gay kay kon say error pay kia code send karin 
    }
}
export {ApiResponce}