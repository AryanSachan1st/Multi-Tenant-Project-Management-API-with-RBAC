import express from "express"
import cookieparser from "cookie-parser"

const app = express()

// middlewares
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieparser())

// routers
// api health check route
import { apiHealthRoute } from "./routes/apiHealth.route.js"
app.use("/", apiHealthRoute)

// user routes
import { userRouter } from "./routes/user.route.js"
app.use("/api/v1/users", userRouter)

// organisation routes
import { orgRouter } from "./routes/organisation.route.js"
app.use("/api/v1/organisations", orgRouter)

// project routes
import { projectRouter } from "./routes/project.route.js"
app.use("/api/v1/organisations/:orgId/projects", projectRouter)

// task routes
import { taskRouter } from "./routes/task.route.js"
app.use("/api/v1/organisations/:orgId/projects/:projId/tasks", taskRouter)


// global error handler
app.use((err, req, res, next) => {
    let code = err.code || 500
    let message = err.message || "Internal Server Error"

    if (err.name === "CastError") {
        code = 400
        message = "Resource not found, invalid parameter"
    } else if (err.code === 11000) {
        code = 409
        message = "Duplicate field value entered"
    } else if (err.name === "ValidationError") {
        code = 400,
        message = Object.values(err.errors || {}).map((error) => error.message).join(", ")
    }

    return res.status(code).json(
        {
            success: false,
            statusCode: code,
            errorMessage: message,
            errors : err.errors || [],
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined
        }
    )
})

export { app }