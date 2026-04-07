import { Hono } from "hono";
import { publicContract } from "@/route/contract";

const app = new Hono();

app.route("/contracts", publicContract);

export default app;
