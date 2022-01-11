import e, { Response, Request, NextFunction } from "express";
import { get } from "lodash";
import { verifyToken } from "../utils/jwt.utils";
import { reIssueUserAccessToken } from "../services/sessions.services";
import RespondWithError from "../utils/error.utils";
import { StatusCodes } from "http-status-codes";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let accessToken: string = "",
    refreshToken: string = "";
  if (get(req, "headers.authorization")) {
    accessToken = get(req, "headers.authorization").split(" ")[1];
  } else if (get(req, "cookies.userAccessToken")) {
    accessToken = get(req, "cookies.userAccessToken");
  }

  if (get(req, "headers.x-refresh")) {
    refreshToken = get(req, "headers.x-refresh");
  } else if (get(req, "cookies.userRefreshToken")) {
    refreshToken = get(req, "cookies.userRefreshToken");
  }

  if (!accessToken)
    return next(
      new RespondWithError("You are not authaticated", StatusCodes.FORBIDDEN)
    );

  const { valid, expired, verified } = await verifyToken(accessToken);

  if (valid && !expired && verified) {
    // @ts-ignore
    req.user = get(verified, "._doc._id");

    // @ts-ignore
    req.session = verified.session;

    return next();
  }

  if (!verified && expired && refreshToken) {
    const newAccessToken = await reIssueUserAccessToken(refreshToken);

    if (newAccessToken) {
      // @ts-ignore
      res.setHeader("x-access-token", newAccessToken);

      // @ts-ignore
      const { verified } = await verifyToken(newAccessToken);

      // @ts-ignore
      req.user = verified._doc._id;

      // @ts-ignore
      req.session = verified.session;

      return next();
    }
  } else {
    next();
  }
};
