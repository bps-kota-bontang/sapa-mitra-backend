import { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";

export type Result<T> = {
  data: T | null;
  message: string;
  code: ContentfulStatusCode;
};
