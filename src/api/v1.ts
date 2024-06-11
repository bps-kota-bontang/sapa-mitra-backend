import { Hono } from "hono";
import auth from "@/route/auth";
import product from "@/route/product";
import user from "@/route/user";
import activity from "@/route/activity";
import partner from "@/route/partner";
import configuration from "@/route/configuration";

const app = new Hono();

app.route("/auth", auth);
app.route("/products", product);
app.route("/users", user);

app.route("/activities", activity);
app.route("/partners", partner);
app.route("/configurations", configuration);

export default app;
