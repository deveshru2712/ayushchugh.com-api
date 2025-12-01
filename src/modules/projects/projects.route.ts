import { Hono } from "hono";
import { createProject } from "@/modules/projects/handler/post-create-project.handler";
import { getAllProjects } from "@/modules/projects/handler/get-project.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";

const projectsRoutes = new Hono();

// create project
projectsRoutes.post("/create", authValidator, ...createProject);
// fetch all projects
projectsRoutes.get("/list", ...getAllProjects);

export default projectsRoutes;
