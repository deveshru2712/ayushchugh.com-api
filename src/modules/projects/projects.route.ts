import { Hono } from "hono";
import { createProject } from "@/modules/projects/handler/post-create-project.handler";
import { getAllProjects } from "@/modules/projects/handler/get-project.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";
import { updateProjectById } from "@/modules/projects/handler/patch-project.handler";
import { getProjectById } from "@/modules/projects/handler/get-project-by-id.handler";
import { deleteProjectById } from "@/modules/projects/handler/delete-project-by-id.handler";

const projectsRoutes = new Hono();

// create project
projectsRoutes.post("/create", authValidator, ...createProject);
// fetch all projects
projectsRoutes.get("/list", ...getAllProjects);
// fetch projects by id
projectsRoutes.get("/:id", ...getProjectById);
// delete projects by id
projectsRoutes.delete("/:id", authValidator, ...deleteProjectById);
//update projects by id
projectsRoutes.patch("/update/:id", authValidator, ...updateProjectById);

export default projectsRoutes;
