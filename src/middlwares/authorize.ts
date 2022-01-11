import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import RespondWithError from "../utils/error.utils";
import { omit } from "lodash";
import { findUserById } from "../services/users.services";

export const authorize = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user = await findUserById(req.user);

    if (!user)
      return next(
        new RespondWithError("You are not authorized", StatusCodes.UNAUTHORIZED)
      );

    // @ts-ignore
    if (!roles.includes(user?.role)) {
      return next(
        new RespondWithError("You are not authorized", StatusCodes.UNAUTHORIZED)
      );
    }

    // @ts-ignore
    req.user = omit(user?.toJSON(), ["password", "role", "isEmailConfirmed"]);

    return next();
  };
};
