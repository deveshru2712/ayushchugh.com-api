import { Hono } from "hono";
import { addExperience } from "@/modules/experience/handlers/post-add-experience.handler";
import { getAllExperiences } from "@/modules/experience/handlers/get-experience.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";
import { updateExperienceById } from "@/modules/experience/handlers/patch-experience.handler";
import { getExperienceByTag } from "@/modules/experience/handlers/get-experience-by-tag.handler";
import { getExperienceById } from "@/modules/experience/handlers/get-experience-by-id.handler";

const experienceRoutes = new Hono();

// add experience
experienceRoutes.post("/create", authValidator, ...addExperience);
// get all expriences
experienceRoutes.get("/list", ...getAllExperiences);
// get experience by id
experienceRoutes.get("/:id", ...getExperienceById);
// get experiences by tag
experienceRoutes.get("/:tag", ...getExperienceByTag);
//update experiences by id
experienceRoutes.patch("/update/:id", authValidator, ...updateExperienceById);

export default experienceRoutes;
