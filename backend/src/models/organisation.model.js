import { Schema, model } from "mongoose"

const organisationSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        desc: {
            type: String
        }
    },
    {timestamps: true}
)

export const Organisation = model("Organisation", organisationSchema)