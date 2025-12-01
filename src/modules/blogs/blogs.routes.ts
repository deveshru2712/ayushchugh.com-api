import { Hono } from "hono";
import { createBlog } from "./handlers/post-create-blog.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";
import { getAllBlogs } from "@/modules/blogs/handlers/get-blogs.handler";
import { getBlogById } from "@/modules/blogs/handlers/get-blogs-by-id.handler";

const blogRoutes = new Hono();

// create blogs
blogRoutes.post("/create", authValidator, ...createBlog);
// get list of all blogs
blogRoutes.get("/list", ...getAllBlogs);
// get a specific blog by id
blogRoutes.get("/:id", ...getBlogById);

export default blogRoutes;
