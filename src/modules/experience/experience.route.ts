import { Hono } from "hono";
import { addExperience } from "@/modules/experience/handlers/post-add-experience.handler";
import { getAllExperiences } from "@/modules/experience/handlers/get-experience.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";
import { updateExperienceById } from "@/modules/experience/handlers/patch-experience.handler";

const experienceRoutes = new Hono();

// add experience
experienceRoutes.post("/create", authValidator, ...addExperience);
// get all expriences
experienceRoutes.get("/list", ...getAllExperiences);
//update experiences by id
experienceRoutes.patch("/update/:id", ...updateExperienceById);

export default experienceRoutes;
