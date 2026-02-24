import { ApiResponse } from "../utils/ApiResponse.js";

const apiHealthCheck =  (_, res) => {
    return res.status(200).json(
        new ApiResponse(200, {}, "RBAC API is running and healthy")
    )
}

export{ apiHealthCheck }