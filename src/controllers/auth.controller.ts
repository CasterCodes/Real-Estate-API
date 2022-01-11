import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { omit, get } from "lodash";
import { createUser, findUser } from "../services/users.services";
import catchAsyncHandler from "../utils/catchAsync.utils";
import RespondWithError from "../utils/error.utils";
import Email from "../utils/email";
import crypto from "crypto";
import {
  sendConfirmPhoneNumber,
  confirmPhoneNumberCode,
} from "../utils/message.twilio";

// @desc - forgot password
// @route - /api/v1/auth/signup
// @route - POST
// @ccess - Public

export const userSignupHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userEmail = await findUser({ email: req.body.email });

    if (userEmail)
      return next(
        new RespondWithError(
          "The email is alreay taken",
          StatusCodes.BAD_REQUEST
        )
      );

    const user = await createUser(req.body);

    if (req.body.identityMethod === "sms" && req.body.phone) {
      await sendConfirmPhoneNumber(`${req.body.phone}`);

      const phoneNumberToken = user.createConfirmPhoneToken();

      await user.save({ validateBeforeSave: false });

      return res.status(StatusCodes.CREATED).json({
        status: "success",
        phoneNumberToken,
        data: {
          user: omit(user.toJSON(), ["password", "confirmEmailToken"]),
        },
      });
    }

    if (req.body.identityMethod === "email" && req.body.email) {
      const emailToken = user.createConfirmEmailToken();

      const confirmUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/confirm-email/${emailToken}`;

      const message = `You are recieveing this email because you need to confirm your email. Use this url \n\n <a href=${confirmUrl} style="padding:4px; background-color:blue; color:white; text-decoration:none;">Confirm Email</a>`;

      await user.save({ validateBeforeSave: false });

      try {
        await new Email(user, message).sendConfirmEmail();
      } catch (error) {
        return next(
          new RespondWithError(get(error, "message"), StatusCodes.BAD_REQUEST)
        );
      }
    }

    res.status(StatusCodes.CREATED).json({
      status: "success",
      data: {
        user: omit(user.toJSON(), ["password", "confirmEmailToken"]),
      },
    });
  }
);

// @desc - forgot password
// @route - /api/v1/auth/confirm-email/:token
// @route - GET
// @ccess - Public

export const confirmUserEmailHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = get(req, "params.token");

    if (!token)
      return next(
        new RespondWithError(
          "There is not email confirmation token",
          StatusCodes.BAD_REQUEST
        )
      );

    const splitToken = token.split(".")[0];

    const confirmEmailToken = crypto
      .createHash("sha256")
      .update(splitToken)
      .digest("hex");

    const user = await findUser({ confirmEmailToken, isEmailConfirmed: false });

    if (!user)
      return next(
        new RespondWithError(
          "Your email confirm token is invalid",
          StatusCodes.BAD_REQUEST
        )
      );

    user.confirmEmailToken = undefined;

    user.isEmailConfirmed = true;

    user.isAccountActive = true;

    await user.save({ validateBeforeSave: false });

    res.status(StatusCodes.OK).json({
      status: "success",
      message:
        "Your email was successfully confirmed you can now login into your account",
    });
  }
);

export const confirmUserPhoneNumberHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, code, phone } = get(req, "body");

    const hashedToken = crypto
      .createHash("sha256")
      .update(token.split(".")[0])
      .digest("hex");

    const user = await findUser({ confirmPhoneNumberToken: hashedToken });

    if (!user) {
      return next(
        new RespondWithError("No user with that token", StatusCodes.BAD_REQUEST)
      );
    }

    const isPhoneNumberValid = await confirmPhoneNumberCode(phone, code);

    if (!isPhoneNumberValid.valid)
      return next(
        new RespondWithError(
          "Your phone number is not valid. Try validating the number again",
          StatusCodes.BAD_REQUEST
        )
      );

    user.isPhoneNumberConfirmed = true;

    user.isAccountActive = true;

    user.confirmPhoneNumberToken = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(StatusCodes.OK).json({
      status: "success",
      message:
        "Your phone number is was confirmed... You can now login into you account",
    });
  }
);

// @desc - forgot password
// @route - /api/v1/auth/forgot-password
// @route - POST
// @ccess - Public

export const forgotPasswordHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await findUser({ email: req.body.email });

    if (!user)
      return next(
        new RespondWithError(
          "Sorry! There is not user with that account",
          StatusCodes.BAD_REQUEST
        )
      );

    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/reset-password/${resetToken}`;

    const message = `You requested to reset you password please Use this url \n\n <a href=${resetUrl} style="padding:4px; background-color:blue; color:white; text-decoration:none;">Confirm Email</a>. You token expires in ten minutes`;

    try {
      await new Email(user, message).sendResetPassword();
    } catch (error) {
      user.passwordResetToken = undefined;

      user.passwordResetTokenExpiresIn = undefined;

      await user.save({ validateBeforeSave: false });

      return next(
        new RespondWithError(get(error, "message"), StatusCodes.BAD_REQUEST)
      );
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      message:
        "A link to change your password has been sent to your email: Your token expires in 10 minutes",
    });
  }
);

// @desc - forgot password
// @route - /api/v1/auth/reset-password/:token
// @route - POST
// @ccess - Public

export const resetPasswordHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, confirmPassword } = get(req, "body");

    const resetToken = req.params.token.split(".")[0];

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await findUser({
      passwordResetToken: hashedToken,
      passwordResetTokenExpiresIn: { $gt: Date.now() },
    });

    if (!user)
      return next(
        new RespondWithError(
          "Your password reset token has expired or it invalid",
          StatusCodes.BAD_REQUEST
        )
      );

    user.password = password;

    user.passwordResetToken = undefined;

    user.passwordResetTokenExpiresIn = undefined;

    await user.save();

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Password was successfully changed you can now login.",
    });
  }
);

// @desc - Change password
// @route - /api/v1/auth/change-password
// @route - POST
// @ccess - Private

export const changePasswordHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = get(req, "body");
    const user = await findUser({ _id: get(req, "user._id") });

    if (!(await user?.comparePassword(currentPassword)))
      return next(
        new RespondWithError(
          "You current password is not correct",
          StatusCodes.FORBIDDEN
        )
      );

    // @ts-ignore
    user.password = newPassword;

    await user?.save();

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "You password was successfully updated",
    });
  }
);

// @desc - get currently logged in user
// @route - /api/v1/auth/change-password
// @route - GET
// @ccess - Private
export const getMeHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = get(req, "user");

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);
