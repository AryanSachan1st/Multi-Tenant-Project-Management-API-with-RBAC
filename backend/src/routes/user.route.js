import { Router } from "express"
import { register, login, logout, deleteUser, assignProject, assignTask, leaveOrganisation, joinOrganisation, updateUser } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { verifyRole } from "../middlewares/role.middleware.js"

const userRouter = Router()

// base url --> /api/v1/users
userRouter.route("/register-user").post(register)
userRouter.route("/login").post(login)
userRouter.route("/logout").post(verifyJWT, logout)
userRouter.route("/update-user").patch(verifyJWT, updateUser)
userRouter.route("/delete-user").delete(verifyJWT, deleteUser)
userRouter.route("/:userId/assign-project").patch(verifyJWT, verifyRole("organisation manager"), assignProject)
userRouter.route("/:userId/assign-task").patch(verifyJWT, verifyRole("project manager"), assignTask)
userRouter.route("/leave-organisation").patch(verifyJWT, leaveOrganisation)
userRouter.route("/join-organisation").post(verifyJWT, joinOrganisation)

export { userRouter }