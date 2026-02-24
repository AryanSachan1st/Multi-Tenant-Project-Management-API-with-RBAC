class ApiError extends Error {
    constructor (
        code,
        message = "Something went wrong please try again after some time",
        errors = []
    ) {
        super(message)
        this.message = message
        this.code = code
        this.data = null
        this.errors = errors
        this.success = false
    }
}

export { ApiError }