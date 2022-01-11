import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { omit, get } from "lodash";
import User from "../models/user.model";
import ApiFeatures from "../utils/api.features.utils";
import catchAsyncHandler from "../utils/catchAsync.utils";
import {
  deleteUser,
  findUser,
  findUserById,
  updateUser,
} from "../services/users.services";
import RespondWithError from "../utils/error.utils";
import { cacheResource } from "../utils/cache.resource";

// @desc - Get all users
// @route - /api/v1/users
// @route - GET
// @ccess - Private/admin
export const getAllUsersHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const features = new ApiFeatures(User.find(), req.query).filter();

    // @ts-ignore
    const users = await features.query;

    // @ts-ignore
    const newUsers = users.map((user) =>
      omit(user.toJSON(), ["password", "__v"])
    );

    console.log("End point hit");

    // cached resource
    await cacheResource("users", newUsers);

    return res.status(StatusCodes.OK).json({
      status: "success",
      // @ts-ignore
      total: users.length,
      data: {
        users: newUsers,
      },
    });
  }
);

// @desc - Get all users
// @route - /api/v1/users/:id
// @route - GET
// @ccess - Private/admin
export const getUsersHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = get(req, "params.id");

    const user = await findUserById(userId);

    if (!user)
      return next(
        new RespondWithError(
          `There is not user with ${userId} id`,
          StatusCodes.NOT_FOUND
        )
      );

    const cleanUser = omit(user.toJSON(), ["password"]);

    const key = `user-${userId}`;

    // cached resource
    await cacheResource(key, cleanUser);

    return res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        user: cleanUser,
      },
    });
  }
);

// @desc - delete User
// @route - /api/v1/users
// @route - POST
// @ccess - Private/admin
export const deleteUserHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { id } = req.params;

    const user = await findUser({ _id: id });

    if (!user)
      return next(
        new RespondWithError(`No user with that id`, StatusCodes.NOT_FOUND)
      );

    await deleteUser(id);

    res.status(StatusCodes.OK).json({
      status: "success",
    });
  }
);

// @desc - update user
// @route - /api/v1/users/:id
// @route - PUT
// @ccess - Private/admin/user/agent
export const updateUserHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = get(req, "params");

    if (req.body.password)
      return next(
        new RespondWithError(
          "You can't update password from this route",
          StatusCodes.FORBIDDEN
        )
      );

    const update = req.body;

    const user = await findUser({ _id: id });

    if (!user)
      return next(
        new RespondWithError(
          "There is no user with that id",
          StatusCodes.NOT_FOUND
        )
      );

    const updatedUser = await updateUser({ _id: id }, update);

    return res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        property: updatedUser,
      },
    });
  }
);

export const uploadUserProfileImageHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = get(req, "user._id");

    const user = await findUserById(userId);

    if (!user)
      return next(
        new RespondWithError(
          "There is no user with that id",
          StatusCodes.NOT_FOUND
        )
      );

    // @ts-ignore
    user.photo = req.file?.filename;

    await user.save({ validateBeforeSave: false });

    res.status(StatusCodes.OK).json({
      status: "success",
    });
  }
);
