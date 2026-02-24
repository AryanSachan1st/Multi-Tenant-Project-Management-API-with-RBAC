import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import { createTask, updateTask, deleteTask, getAllDevelopers, getAllTasks, demoteDeveloper, getAllUsers, toggleComplete} from "../controllers/task.controller.js"

const taskRouter = Router()

// base URL --> "/api/v1/organisations/:orgId/projects/:projId/tasks"
taskRouter.route("/create-task").post(verifyJWT, verifyRole("project manager"), createTask)

taskRouter.route("/:taskId").patch(verifyJWT, verifyRole("project manager"), updateTask).delete(verifyJWT, verifyRole("project manager"), deleteTask)

taskRouter.route("/:taskId/toggle-complete").patch(verifyJWT, verifyRole("developer"), toggleComplete)

taskRouter.route("/get-all-developers").get(verifyJWT, verifyRole("project manager"), getAllDevelopers)

taskRouter.route("/get-all-tasks").get(verifyJWT, verifyRole("project manager"), getAllTasks)

taskRouter.route("/:taskId/users/:userId").patch(verifyJWT, verifyRole("project manager"), demoteDeveloper)

taskRouter.route("/get-all-users").get(verifyJWT, verifyRole("project manager"), getAllUsers)

export { taskRouter }