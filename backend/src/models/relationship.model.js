import { Schema, model } from "mongoose"

// Only this file stores the relationship of users to any of the resources (org, proj, task, etc)

const relationshipSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        organisation: {
            type: Schema.Types.ObjectId,
            ref: "Organisation",
            required: true
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project"
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: "Task"
        },
        role: {
            type: String,
            default: "member"
        }
    },
    {timestamps: true}
)

export const Relationship = model("Relationship", relationshipSchema)