import { Hono } from "hono";
import authRoutes from "@/modules/auth/auth.routes";
import blogRoutes from "@/modules/blog/blogs.routes";
import experienceRoutes from "@/modules/work/experience.route";
import projectsRoutes from "@/modules/projects/projects.route";
import educationRoutes from "@/modules/education/education.route";
import volunteerRoutes from "@/modules/volunteer/volunteer.route";

const apiV1Routes = new Hono();

apiV1Routes.route("/v1/auth", authRoutes);
apiV1Routes.route("/v1/blog", blogRoutes);
apiV1Routes.route("/v1/work", experienceRoutes);
apiV1Routes.route("/v1/project", projectsRoutes);
apiV1Routes.route("/v1/education", educationRoutes);
apiV1Routes.route("/v1/volunteer", volunteerRoutes);

export default apiV1Routes;
