import { Hono } from "hono";
import auth from "@/route/auth";
import user from "@/route/user";
import activity from "@/route/activity";
import partner from "@/route/partner";
import configuration from "@/route/configuration";
import contract from "@/route/contract";
import output from "@/route/output";
import report from "@/route/report";
import status from "@/route/status";

const app = new Hono();

app.route("/auth", auth);
app.route("/users", user);
app.route("/outputs", output);
app.route("/activities", activity);
app.route("/partners", partner);
app.route("/configurations", configuration);
app.route("/contracts", contract);
app.route("/reports", report);
app.route("/statuses", status);

export default app;
