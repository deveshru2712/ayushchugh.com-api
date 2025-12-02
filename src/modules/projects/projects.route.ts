import { Hono } from "hono";
import { createProject } from "@/modules/projects/handler/post-create-project.handler";
import { getAllProjects } from "@/modules/projects/handler/get-project.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";
import { updateProjectById } from "@/modules/projects/handler/patch-project.handler";

const projectsRoutes = new Hono();

// create project
projectsRoutes.post("/create", authValidator, ...createProject);
// fetch all projects
projectsRoutes.get("/list", ...getAllProjects);
//update projects by id
projectsRoutes.patch("/update/:id", ...updateProjectById);

export default projectsRoutes;
