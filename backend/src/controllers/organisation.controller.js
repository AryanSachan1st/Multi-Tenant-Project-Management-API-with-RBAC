import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Organisation } from "../models/organisation.model.js";
import { Relationship } from "../models/relationship.model.js";
import { Project } from "../models/project.model.js"
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

// Note: the one who creates an organisation will automatically become the manager of that organisation
/*
What is done in an organisation level-
1. create organisation
2. update organisation
3. delete organisation
4. get all members of an organisation
5. get all organisations
6. get all organisations managers
7. demote an organisation manager
*/
const createOrganisation = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const {name, desc} = req.body

    if (!name) {
        throw new ApiError(400, "Name is required")
    }

    // user will create an organisation
    const organisation = await Organisation.create(
        {
            name: name,
            ...(desc && {desc})
        }
    )

    await Relationship.create(
        {
            user: userId,
            organisation: organisation._id,
            role: "organisation manager"
        }
    )

    return res.status(201).json(
        new ApiResponse(201, organisation, "Organisation created successfully")
    )

})
const updateOrganisation = asyncHandler(async (req, res) => {
    const { orgId } = req.params
    const { name, desc } = req.body

    const updatedOrganisation = await Organisation.findByIdAndUpdate(
        orgId,
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

    if (!updatedOrganisation) {
        throw new ApiError(404, "Organisation does not exists")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedOrganisation, "Organisation updated successfully")
    )

})
const deleteOrganisation = asyncHandler(async (req, res) => {
    const { orgId } = req.params
    
    const deletedOrganisation = await Organisation.findByIdAndDelete(orgId)

    if (!deletedOrganisation) {
        throw new ApiError(404, "Organisation does not exists")
    }

    // TODO: relationship should also be deleted

    return res.status(200).json(
        new ApiResponse(200, deletedOrganisation, "Organisation deleted successfully")
    )
})
const getAllUsers = asyncHandler(async (req, res) => {
    const { orgId } = req.params

    if (!mongoose.isValidObjectId(orgId)) {
        throw new ApiError(400, "Invalid organisation id")
    }

    const allMembers = await Relationship.find(
        {
            organisation: orgId
        },
        { // no use of $project: here ($project is used in aggregation)
            user: 1,
            organisation: 1,
            role: 1
        }
    )

    if (!allMembers) {
        throw new ApiError(404, "Organisation does not exists")
    }

    return res.status(200).json(
        new ApiResponse(200, allMembers, "All members of the organisation fetched successfully")
    )
})
const getAllOrganisations = asyncHandler(async (req, res) => {
    const organisations = await Organisation.find()

    return res.status(200).json(
        new ApiResponse(200, organisations, "Fetched all organisations successfully")
    )
})
const getAllOrganisationsManagers = asyncHandler(async (req, res) => {

    const organisationManagers = await Relationship.find(
        {
            organisation: { $exists: true, $ne: null },
            role: "organisation manager"
        },
        {
            user: 1,
            organisation: 1
        }
    )

    return res.status(200).json(
        new ApiResponse(200, organisationManagers, "All organisation managers fetched successfully")
    )
})
const demoteOrgManager = asyncHandler(async (req, res) => {
    const { newManagerId } = req.body
    const { orgId } = req.params

    const relation = await Relationship.findOne(
        {
            organisation: orgId,
            role: "organisation manager"
        }
    )

    if (!await User.findById(newManagerId)) {
        throw new ApiError(404, "Manager does not exists")
    }

    if (!await Organisation.findById(orgId)) {
        throw new ApiError(404, "Organisation does not exists")
    }

    const demotedRelation = await Relationship.findOneAndUpdate(
        {
            user: relation.user,
            organisation: orgId,
            role: "organisation manager"
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
            organisation: orgId,
            role: "member"
        },
        {
            $set: {
                role: "organisation manager"
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!demotedRelation) {
        throw new ApiError(404, "This User is not the organisation manager of any organisation")
    }

    return res.status(200).json(
        new ApiResponse(200, demotedRelation, "Organisation manager demoted successfully")
    )
})

export { createOrganisation, updateOrganisation, deleteOrganisation, getAllUsers, getAllOrganisations, getAllOrganisationsManagers, demoteOrgManager}