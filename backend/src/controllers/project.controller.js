import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.model.js";
import { Organisation } from "../models/organisation.model.js";
import { User } from "../models/user.model.js";
import { Relationship } from "../models/relationship.model.js";
import { Task } from "../models/task.model.js"


const createProject = asyncHandler(async (req, res) => {
    const { orgId } = req.params
    const {name, desc} = req.body

    if (!await Organisation.findById(orgId)) {
        throw new ApiError(404, "Organisation does not exists")
    }

    if (!name) {
        throw new ApiError(400, "Name and Manager id is required")
    }

    const project = await Project.create(
        {
            name: name,
            ...(desc && {desc}),
            organisation: orgId
        }
    )

    return res.status(200).json(
        new ApiResponse(200, project, "Project created successfully")
    )
})
const deleteProject = asyncHandler(async (req, res) => {
    const { orgId, projId } = req.params

    if (!await Organisation.findById(orgId)) {
        throw new ApiError(404, "Organisation does not exists")
    }

    const deletedProject = await Project.findOneAndDelete(
        {
            _id: projId,
            organisation: orgId
        }
    )

    if (!deletedProject) {
        throw new ApiError(404, "Project does not belong to this organisation")
    }

    return res.status(200).json(
        new ApiResponse(200, deletedProject, "Project deleted successfully")
    )
})
const updateProject = asyncHandler(async (req, res) => {
    const { orgId, projId } = req.params
    const { name, desc } = req.body

    if (!await Organisation.findById(orgId)) {
        throw new ApiError(404, "Organisation does not exists")
    }

    if (!await Project.findById(projId)) {
        throw new ApiError(404, "Project does not exists")
    }

    if (taskId && !await Task.findById(taskId)) {
        throw new ApiError(404, `Task: ${taskId} does not exists`)
    }

    const updatedProject = await Project.findOneAndUpdate(
        {
            organisation: orgId,
            _id: projId
        },
        {
            $set: {
                ...(name && {name}),
                ...(desc && {desc}),
            }
        },
        {
            new : true,
            runValidators: true
        }
    )

    if (!updatedProject) {
        throw new ApiError(404, "Project does not belong to this organisation")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedProject, "Project updated successfully")
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

    const allProjectUsers = await Relationship.find(
        {
            organisation: orgId,
            project: projId
        }
    )

    return res.status(200).json(
        new ApiResponse(200, allProjectUsers, "All project members fetched successfully")
    )
})
const getAllProjects = asyncHandler(async (req, res) => {
    const { orgId } = req.params

    if (!await Organisation.findById(orgId)) {
        throw new ApiError(404, "Organisation does not exists")
    }

    const allProjects = await Project.find({ organisation: orgId })

    return res.status(200).json(
        new ApiResponse(200, allProjects, "All Projects for the organisation fetched successfully")
    )
})
const getAllProjectManagers = asyncHandler(async (req, res) => {
    const { orgId } = req.params

    if (!await Organisation.findById(orgId)) {
        throw new ApiError(404, "Organisation does not exists")
    }

    const allProjectManagers = await Relationship.find(
        {
            organisation: orgId,
            project: { $exists: true, $ne: null },
            role: "project manager"
        }
    )

    return res.status(200).json(
        new ApiResponse(200, allProjectManagers, "All project managers of the organisation are fetched successfully")
    )
})
const demoteProjectManager = asyncHandler(async (req, res) => {
    const { orgId, projId: projectId } = req.params
    const { newManagerId } = req.body // id of new project manager because as soon as the current project manager will get demotion we have to assign a new project manager

    if (!await User.findById(newManagerId)) {
        throw new ApiError(404, "Manager does not exists")
    }

    if (!await Project.findById(projectId)) {
        throw new ApiError(404, "Project does not exists")
    }

    if (!await Organisation.findById(orgId)) {
        throw new ApiError(404, "Organisation does not exists")
    }

    const demotedRelation = await Relationship.findOneAndUpdate(
        {
            organisation: orgId,
            project: projectId,
            role: "project manager"
        },
        {
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
            user: newManagerId,
            organisation: orgId
        },
        {
            $set: {
                project: projectId,
                role: "project manager"
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    return res.status(200).json(
        new ApiResponse(200, {
            "demotedManager's Id": demotedRelation.user,
            "newManager's Id": promotedRelation.user
        }, "Project Manager's demotion and new Project Manager assigned successfully")
    )
})

export { createProject, deleteProject, updateProject, getAllUsers, getAllProjectManagers, getAllProjects, demoteProjectManager }