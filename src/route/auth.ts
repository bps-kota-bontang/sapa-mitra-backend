import {
  CLIENT_URL,
  GATE_AUTH_REALM,
  GATE_AUTH_TYPE,
  GATE_SERVICE_ID,
  GATE_URL,
  generateState,
} from "@/common/utils";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { login, loginSso } from "@/service/auth";

import { Hono } from "hono";

const app = new Hono();

app.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  const result = await login(email, password);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.get("/sso", async (c) => {
  const state = generateState();

  setCookie(c, "state", state, {
    expires: new Date(Date.now() + 300 * 1000),
    httpOnly: true,
    maxAge: 300,
    path: "/",
    secure: true,
    sameSite: "Lax",
  });

  const gateUrl = new URL("/api/v1/auth/sso", GATE_URL);
  gateUrl.searchParams.set("state", state);
  gateUrl.searchParams.set("service_id", GATE_SERVICE_ID);
  gateUrl.searchParams.set("type", GATE_AUTH_TYPE);
  gateUrl.searchParams.set("realm", GATE_AUTH_REALM);

  return c.redirect(gateUrl.toString());
});

app.get("/callback", async (c) => {
  const state = c.req.query("state");
  const code = c.req.query("code");
  const type = c.req.query("type");
  const realm = c.req.query("realm");

  const cookieState = getCookie(c, "state");
  deleteCookie(c, "state", {
    path: "/",
    secure: true,
    sameSite: "Lax",
  });

  if (!cookieState) {
    return c.redirect(CLIENT_URL + "/masuk?error=state_not_found");
  }

  if (cookieState !== state) {
    return c.redirect(CLIENT_URL + "/masuk?error=invalid_state");
  }

  if (!code) {
    return c.redirect(CLIENT_URL + "/masuk?error=code_not_found");
  }

  if (type !== GATE_AUTH_TYPE || realm !== GATE_AUTH_REALM) {
    return c.redirect(CLIENT_URL + "/masuk?error=invalid_auth_parameters");
  }

  const userAgent = c.req.header("user-agent") || "Mozilla/5.0";

  let result;
  try {
    result = await loginSso(code, type, realm, userAgent);
  } catch {
    return c.redirect(CLIENT_URL + "/masuk?error=login_failed");
  }

  if (result.code != 200) {
    const error = result.code === 404 ? "user_not_found" : "login_failed";
    return c.redirect(CLIENT_URL + "/masuk?error=" + error);
  }

  return c.redirect(CLIENT_URL + "/masuk?token=" + result.data.token);
});

export default app;
