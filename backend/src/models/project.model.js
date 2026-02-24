import { Schema, model } from "mongoose"

const projectSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        desc: {
            type: String
        },
        organisation: {
            type: Schema.Types.ObjectId,
            ref: "Organisation",
            required: true
        }
    },
    {timestamps: true}
)

export const Project = model("Project", projectSchema)