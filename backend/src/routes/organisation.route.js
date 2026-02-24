import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { verifyRole } from "../middlewares/role.middleware.js"
import { createOrganisation, updateOrganisation, deleteOrganisation, getAllUsers, getAllOrganisations, getAllOrganisationsManagers, demoteOrgManager } from "../controllers/organisation.controller.js"

const orgRouter = Router()

// organisation manager's role
// base ULR -> "/api/v1/organisations"
orgRouter.route("/create-organisation").post(verifyJWT, createOrganisation)

orgRouter.route("/:orgId").patch(verifyJWT, verifyRole("organisation manager"), updateOrganisation).delete(verifyJWT, verifyRole("organisation manager"), deleteOrganisation)

orgRouter.route("/:orgId/users").get(verifyJWT, verifyRole("organisation manager"), getAllUsers)

orgRouter.route("/get-all-organisations").get(verifyJWT, getAllOrganisations)

orgRouter.route("/get-all-organisation-managers").get(verifyJWT, verifyRole("owner"), getAllOrganisationsManagers)

orgRouter.route("/:orgId/demote-organisation-manager").patch(verifyJWT, verifyRole("owner"), demoteOrgManager)

export { orgRouter }