import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import { createProject, deleteProject, updateProject, getAllUsers, getAllProjectManagers, getAllProjects, demoteProjectManager } from "../controllers/project.controller.js"

const projectRouter = Router()

// organisation manager's role
// base URL --> "/api/v1/organisations/:orgId/projects"
projectRouter.route("/create-project").post(verifyJWT, verifyRole("organisation owner"), createProject)

projectRouter.route("/:projId").patch(verifyJWT, verifyRole("project owner"), updateProject).delete(verifyJWT, verifyRole("project owner"), deleteProject)

projectRouter.route("/").get(verifyJWT, verifyRole("organisation owner"), getAllProjects)

projectRouter.route("/get-all-project-managers").get(verifyJWT, verifyRole("organisation manager"), getAllProjectManagers)

projectRouter.route("/:projId/demote-project-manager").patch(verifyJWT, verifyRole("organisation manager"), demoteProjectManager)

projectRouter.route("/:projId/users").get(verifyJWT, verifyRole("project manager"), getAllUsers)

export { projectRouter }