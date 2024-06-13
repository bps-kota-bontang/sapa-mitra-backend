import { Hono } from "hono";
import auth from "@/route/auth";
import user from "@/route/user";
import activity from "@/route/activity";
import partner from "@/route/partner";
import configuration from "@/route/configuration";
import contract from "@/route/contract";

const app = new Hono();

app.route("/auth", auth);
app.route("/users", user);

app.route("/activities", activity);
app.route("/partners", partner);
app.route("/configurations", configuration);
app.route("/contracts", contract);

export default app;
