import { Schema, model } from "mongoose";

const taskSchema = new Schema(
    {
        name: {
            type: String
        },
        desc: {
            type: String,
            required: true
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },
        complete: {
            type: Boolean,
            default: false
        }
    },
    {timestamps: true}
)

export const Task = model("Task", taskSchema)