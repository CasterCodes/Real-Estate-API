import { Request, Response, NextFunction } from "express";
import { omit } from "lodash";
import { StatusCodes } from "http-status-codes";
import { get } from "lodash";
import {
  createUserAccessToken,
  createUserSession,
  createUserRefreshToken,
  updateUserSession,
  findSessions,
  findSession,
} from "../services/sessions.services";
import { validateUserPassword } from "../services/users.services";
import catchAsyncHandler from "../utils/catchAsync.utils";
import RespondWithError from "../utils/error.utils";
import { setCookie } from "../utils/cookie.util";

// @desc -create User Session
// @route - /api/v1/sessions
// @route - POST
// @ccess - Public

export const createUserSessionHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await validateUserPassword(email, password);

    if (!user)
      return next(
        new RespondWithError(`Invalid password or email`, StatusCodes.NOT_FOUND)
      );

    if (
      user.identityMethod === "email" &&
      !user.isEmailConfirmed &&
      user.confirmEmailToken
    )
      return next(
        new RespondWithError(
          "It seems you have not confirmed your email to login",
          StatusCodes.FORBIDDEN
        )
      );

    if (
      user.identityMethod === "sms" &&
      !user.isPhoneNumberConfirmed &&
      user.confirmPhoneNumberToken
    )
      return next(
        new RespondWithError(
          "It seems you have not confirmed your email to login",
          StatusCodes.FORBIDDEN
        )
      );

    let session = await findSession({ user: get(user, "_id") });

    // if there is not session with that user id create new session
    if (!session)
      session = await createUserSession(user._id, req.get("user-agent") || "");

    // if there is user session and the seasion is inactive or user agent if different create a new session

    if (
      (session && !get(session, "valid")) ||
      (session && get(session, "userAgent") !== req.get("user-agent"))
    ) {
      session = await createUserSession(user._id, req.get("user-agent") || "");
    }

    const userAccessToken = await createUserAccessToken(user, session);

    const userRefreshToken = await createUserRefreshToken(session);

    setCookie(res, "userAccessToken", userAccessToken);

    setCookie(res, "userRefreshToken", userRefreshToken);

    return res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        user: omit(user.toJSON(), ["password", "__v", "_id"]),
        userAccessToken,
        userRefreshToken,
      },
    });
  }
);

// @desc - invalidate user session
// @route - /api/v1/sessions/:id
// @route - POST
// @ccess - Public
export const inValidateUserAccessTokenHandler = catchAsyncHandler(
  async (req: Request, res: Response) => {
    let sessionId = get(req, "session");

    await updateUserSession(sessionId);

    return res.status(StatusCodes.OK).json({
      status: "success",
    });
  }
);

export const getUserSessionsHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const currentUserId = get(req, "user._id");

    const sessions = await findSessions({ user: currentUserId, active: true });

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        sessions,
      },
    });
  }
);
