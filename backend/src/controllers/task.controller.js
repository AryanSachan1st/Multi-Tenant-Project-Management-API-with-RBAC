import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js"
import { Relationship } from "../models/relationship.model.js";
import { Organisation } from "../models/organisation.model.js";

const createTask = asyncHandler(async (req, res) => {
    const { projId } = req.params
    const { name, desc } = req.body

    if (!await Project.findById(projId)) {
        throw new ApiError(404, "Project does not exists")
    }

    if (!desc) {
        throw new ApiError(400, "Task description is required")
    }

    const task = await Task.create(
        {
            ...(name && {name}),
            desc: desc,
            project: projId
        }
    )

    return res.status(200).json(
        new ApiResponse(200, task, "Task created successfully")
    )
})
const deleteTask = asyncHandler(async (req, res) => {
    const { projId, taskId } = req.params

    if (!await Project.findById(projId)) {
        throw new ApiError(404, "Project does not exists")
    }

    if (!await Task.findById(taskId)) {
        throw new ApiError(404, "Task does not exists")
    }
    
    const deletedTask = await Task.findOneAndDelete(
        {
            project: projId,
            _id: taskId
        }
    )

    if (!deletedTask) {
        throw new ApiError(400, "Task not found inside the project")
    }

    return res.status(200).json(
        new ApiResponse(200, deletedTask, "Task deleted successfully")
    )
})
const updateTask = asyncHandler(async (req, res) => {
    const { projId, taskId } = req.params
    const {name, desc} = req.body

    if (!await Project.findById(projId)) {
        throw new ApiError(404, "Project does not exists")
    }

    if (!await Task.findById(taskId)) {
        throw new ApiError(404, "task does not exists")
    }

    const updatedTask = await Task.findOneAndUpdate(
        {
            _id: taskId,
            project: projId
        },
        {
            $set: {
                ...(name && {name}),
                ...(desc && {desc})
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!updatedTask) {
        throw new ApiError(400, "Task not found inside this project")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedTask, "Task updated successfully")
    )
})
const toggleComplete = asyncHandler(async (req, res) => {
    const { projId, taskId } = req.params

    if (!await Project.findById(projId)) {
        throw new ApiError(404, "Project does not exists")
    }

    if (!await Task.findById(taskId)) {
        throw new ApiError(404, "Task does not exists")
    }

    const task = await Task.findOne(
        {
            _id: taskId,
            project: projId
        }
    )

    if (!task) {
        throw new ApiError(400, "Task does not found inside this project")
    }

    task.complete = !task.complete
    await task.save() // by default: run validation before save

    return res.status(200).json(
        new ApiResponse(200, task, "Toggled complete successfully")
    )
})
const getAllTasks = asyncHandler(async (req, res) => {
    const { projId } = req.params

    if (!await Project.findById(projId)) {
        throw new ApiError(400, "Project does not exists")
    }
    
    const allTasks = await Task.find(
        {
            project: projId
        }
    )

    return res.status(200).json(
        new ApiResponse(200, allTasks, "All tasks of the project fetched successfully")
    )
})
const getAllDevelopers = asyncHandler(async (req, res) => {
    const { orgId, projId } = req.params

    if (!await Organisation.findById(orgId)) {
        throw new ApiError(404, "Organisation does not exists")
    }
    
    if (!await Project.findById(projId)) {
        throw new ApiError(404, "Project does not exists")
    }

    const allDevelopers = await Relationship.find(
        {
            organisation: orgId,
            project: projId,
            role: "developer"
        }
    )

    return res.status(200).json(
        new ApiResponse(200, allDevelopers, "All developers for the project fetched successfully")
    )

})
const demoteDeveloper = asyncHandler(async (req, res) => {
    const { orgId, projId, taskId, userId: devId } = req.params
    const { newDevId } = req.body

    if (!await Organisation.findById(orgId)) {
        throw new ApiError(404, "Organisation does not exists")
    }
    
    if (!await Project.findById(projId)) {
        throw new ApiError(404, "Project does not exists")
    }
    
    if (!await Task.findById(taskId)) {
        throw new ApiError(404, "Task does not exists")
    }

    if (!await User.findById(devId)) {
        throw new ApiError(404, "User does not exists")
    }
    
    const demotedRelation = await Relationship.findOneAndUpdate(
        {
            user: devId,
            organisation: orgId,
            project: projId,
            role: "developer"
        },
        {
            $unset: {
                task: 1
            },
            $set: {
                role: "member"
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    const promotedRelation = await Relationship.findOneAndUpdate(
        {
            user: newDevId,
            organisation: orgId,
            project: projId
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
        new ApiResponse(200, {
            task: taskId,
            demotedDeveloper: demotedRelation.user,
            newDeveloper: promotedRelation.user
        }, "Developer demoted and new Developer assigned to the task")
    )
})
const getAllUsers = asyncHandler(async (req, res) => {
    const { orgId, projId } = req.params

    if (!await Organisation.findById(orgId)) {
        throw new ApiError(404, "Organisation does not exists")
    }

    if (!await Project.findById(projId)) {
        throw new ApiError(404, "Project does not exists")
    }
    
    const allMembers = await Relationship.find(
        {
            organisation: orgId,
            project: projId
        }
    )

    return res.status(200).json(
        new ApiResponse(200, allMembers, "All members of the project fetched successfully")
    )
})

export { createTask, deleteTask, updateTask, getAllTasks, demoteDeveloper, getAllDevelopers, getAllUsers, toggleComplete }