export interface GateUserInfo {
  sub: string;
  email: string;
  name: string;
}

interface GateLoginResponse {
  data?: GateUserInfo;
}

export const getUserInfo = async (
  code: string,
  type: string,
  realm: string,
  userAgent: string
): Promise<GateUserInfo> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(
      "https://gerbang.web.bps.go.id/api/v1/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
        },
        body: JSON.stringify({ code, type, realm }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error("Gerbang BPS login request failed");
    }

    const result = (await response.json()) as GateLoginResponse;
    const user = result?.data;

    if (
      !user ||
      typeof user.sub !== "string" ||
      typeof user.email !== "string" ||
      !user.email.trim() ||
      typeof user.name !== "string"
    ) {
      throw new Error("Gerbang BPS returned an invalid user response");
    }

    return user;
  } finally {
    clearTimeout(timeout);
  }
};
