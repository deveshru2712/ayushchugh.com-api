import { Hono } from "hono";
import { addVolunteerExp } from "@/modules/volunteer/handlers/post-add-volunteer.handler";
import { getVolunteerExp } from "@/modules/volunteer/handlers/get-volunteer.handler";
import { getVolunteerExpById } from "@/modules/volunteer/handlers/get-volunteer-by-id.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";
import { deleteVolunteerExpById } from "@/modules/volunteer/handlers/delete-volunteer-by-id.handler";
import { updateVolunteerExpById } from "@/modules/volunteer/handlers/patch-update-volunteer.handler";

const volunteerRoutes = new Hono();

// add experience
volunteerRoutes.post("/create", authValidator, ...addVolunteerExp);
// get all expriences
volunteerRoutes.get("/list", ...getVolunteerExp);
// get experience by id
volunteerRoutes.get("/:id", ...getVolunteerExpById);
// delete experience by id
volunteerRoutes.delete("/:id", authValidator, ...deleteVolunteerExpById);
//update experiences by id
volunteerRoutes.patch("/update/:id", ...updateVolunteerExpById);

export default volunteerRoutes;
