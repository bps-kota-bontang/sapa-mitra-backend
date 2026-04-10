import { Hono } from "hono";
import { publicContract } from "@/route/contract";
import { publicActivity } from "@/route/activity";

const app = new Hono();

app.route("/contracts", publicContract);
app.route("/activities", publicActivity)

export default app;
