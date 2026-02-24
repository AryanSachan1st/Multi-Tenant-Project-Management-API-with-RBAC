import { Relationship } from "../models/relationship.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/AsyncHandler.js"

const verifyRole = (requiredRole) => {
    return asyncHandler(async (req, _, next) => {
        const { orgId, projId, taskId } = req.params
        const userId = req.user?._id

        const filter = {}

        filter.user = userId
        if (orgId) {
            filter.organisation = orgId
        }
        if (projId) {
            filter.project = projId
        }
        if (taskId) {
            filter.task = taskId
        }

        const userRelationship = await Relationship.findOne(filter)

        if (!userRelationship || userRelationship.role !== requiredRole) { // .role is faster than ["role"]
            throw new ApiError(403, "You are not authorized to perform this action")
        }

        req.userRelationship = userRelationship
        next()
    })
}

export { verifyRole }