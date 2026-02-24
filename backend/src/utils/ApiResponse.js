class ApiResponse {
    constructor (
        code,
        data,
        message = "Request Successful"
    ) {
        this.code = code
        this.data = data
        this.message = message
        this.success = code < 400
    }
}

export { ApiResponse }