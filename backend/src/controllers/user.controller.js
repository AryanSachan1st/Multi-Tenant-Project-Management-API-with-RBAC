import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Relationship } from "../models/relationship.model.js"
import { Project } from "../models/project.model.js"
import { Task } from "../models/task.model.js"
import { Organisation } from "../models/organisation.model.js"

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
}

const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if ([username, email, password].some((field) => field === undefined || field.trim() === "")) {
        throw new ApiError(400, "username, email, password and organisation are required")
    }

    const user = await User.create(
        {
            username: username,
            email: email,
            password: password
        }
    )

    const displayUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(201).json(
        new ApiResponse(201, displayUser, "User created successfully")
    )
})
const login = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Provide either username or email")
    }

    const searchCondn = []
    if (username) searchCondn.push({username})
    if (email) searchCondn.push({email})

    const user = await User.findOne(
        { $or: searchCondn }
    )

    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    if (!await user.isPasswordCorrect(password)) {
        throw new ApiError(400, "Invalid password")
    }

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    const displayUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(200, displayUser, "User logged in successfully")
    )
})
const logout = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    return res.status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
        new ApiResponse(200, {}, `User: ${user._id} logged out successfully`)
    )
})
const updateUser = asyncHandler(async (req, res) => {
    const user = req.user
    const { username, email, password } = req.body

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            $set: {
                ...(username && {username}),
                ...(email && {email}),
                ...(password && {password})
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    const displayUpdatedUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, displayUpdatedUser, "User updated successfully")
    )
})
const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { replacementUserId } = req.body

    if (!await User.findById(replacementUserId)) {
        throw new ApiError(404, "User does not exists")
    }

    const deletedUser = await User.findByIdAndDelete(userId)

    const relation = await Relationship.findOne(userId)

    return res.status(200).json(
        new ApiResponse(200, updatedRelation, "User deleted permanentaly")
    )
})
const assignProject = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { projId } = req.body

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    const project = await Project.findById(projId)

    if (!project) {
        throw new ApiError(404, "Project does not exists")
    }

    const updatedRelation = await Relationship.findOneAndUpdate(
        {
            user: userId,
            organisation: project.organisation,
            role: "member"
        },
        {
            $set: {
                project: projId
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!updatedRelation) {
        throw new ApiError(400, `User: ${userId} must be a member of the organisation: ${project.organisation}`)
    }

    return res.status(200).json(
        new ApiResponse(200, updatedRelation, "Project assigned to organisation member successfully")
    )

})
const assignTask = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { taskId } = req.body

    const user = await User.findById(userId)
    
    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    const task = await Task.findById(taskId)

    if (!task) {
        throw new ApiError(404, "Task does not exists")
    }

    const relation = await Relationship.findOneAndUpdate(
        {
            user: userId,
            project: task.project  
        },
        {
            $set: {
                task: taskId,
                role: "developer"
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    return res.status(200).json(
        new ApiResponse(200, relation, "Developer assigned to task successfully")
    )
})
const leaveOrganisation = asyncHandler(async (req, res) => {
    const user = req.user
    const { replacementUserId, orgId } = req.body

    if (!await User.findById(replacementUserId)) {
        throw new ApiError(404, "Replacement user does not exists")
    }

    if (!await Organisation.findById(orgId)) {
        throw new ApiError(404, "Organisation does not exists")
    }

    const updatedRelation = await Relationship.findOneAndUpdate(
        {
            user: user._id,
            organisation: orgId
        },
        {
            $set: {
                user: replacementUserId
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!updatedRelation) {
        throw new ApiError(404, "You are not a part of this organisation")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedRelation, "You leaved organisation successfully")
    )
})
const joinOrganisation = asyncHandler(async (req, res) => {
    const user = req.user
    const { orgId } = req.body

    if (!await Organisation.findById(orgId)) {
        throw new ApiError(404, "Organisation does not exists")
    }

    if (await Relationship.findOne(
        {
            user: user._id,
            organisation: { $exists: true, $ne: null },
            role: { $ne: "organisation manager" }
        }
    )) {
        throw new ApiError(400, "You have to leave the current organisation to join new organisation")
    }

    const newRelation = await Relationship.create(
        {
            user: user._id,
            organisation: orgId
        }
    )

    return res.status(200).json(
        new ApiResponse(200, newRelation, "Organisation joined successfully")
    )
})

export { register, login, logout, updateUser, deleteUser, assignProject, assignTask, leaveOrganisation, joinOrganisation}