import { Hono } from "hono";
import { addEducation } from "@/modules/education/handlers/post-add-education.handler";
import { getEducation } from "@/modules/education/handlers/get-education.handler";
import { getEducationById } from "@/modules/education/handlers/get-education-by-id.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";
import { deleteEducationById } from "@/modules/education/handlers/delete-education-by-id.handler";
import { updateEducationById } from "@/modules/education/handlers/patch-update-education.handler";

const educationRoutes = new Hono();

// add experience
educationRoutes.post("/create", authValidator, ...addEducation);
// get all expriences
educationRoutes.get("/list", ...getEducation);
// get experience by id
educationRoutes.get("/:id", ...getEducationById);
// delete experience by id
educationRoutes.delete("/:id", authValidator, ...deleteEducationById);
//update experiences by id
educationRoutes.patch("/update/:id", authValidator, ...updateEducationById);

export default educationRoutes;
