import { Router } from "express"
import { apiHealthCheck } from "../controllers/apiHealth.controller.js"

const apiHealthRoute = Router()

apiHealthRoute.route("/").get(apiHealthCheck)

export { apiHealthRoute }