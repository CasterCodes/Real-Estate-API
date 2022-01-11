import { Response } from "express";

import { JWT_COOKIE_EXPIRES_IN } from "../config/config";

export const setCookie = (
  res: Response,
  cookieName: string,
  cookieValue: string
) => {
  return res.cookie(cookieName, cookieValue, {
    expires: new Date(
      Date.now() +
        // @ts-ignore
        JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });
};
