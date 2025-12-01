import { Hono } from "hono";
import { addExperience } from "@/modules/experience/handlers/post-add-experience.handler";
import { getAllExperiences } from "@/modules/experience/handlers/get-experiences.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";

const experienceRoutes = new Hono();

// add experience
experienceRoutes.post("/create", authValidator, ...addExperience);
// get all expriences
experienceRoutes.get("/list", ...getAllExperiences);

export default experienceRoutes;
