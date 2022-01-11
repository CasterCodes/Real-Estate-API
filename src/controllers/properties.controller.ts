import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { get } from "lodash";
import {
  createProperty,
  findAndPopulate,
  findProperty,
  findPropertyAndDelete,
  findPropertyAndUpdate,
} from "../services/properties.services";
import catchAsyncHandler from "../utils/catchAsync.utils";
import RespondWithError from "../utils/error.utils";
import slugify from "slugify";
import ApiFeatures from "../utils/api.features.utils";
import Property from "../models/proterties.model";
import { cacheResource } from "../utils/cache.resource";

export const uploadPropertyImagesHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = get(req, "params");

    const property = await findProperty({ _id: id });

    if (!property)
      return next(
        new RespondWithError(
          `There is not property with ${id} id`,
          StatusCodes.NOT_FOUND
        )
      );

    // @ts-ignore
    property.images = req.files.images.map((image) => image.filename);

    // @ts-ignore
    property.coverImage = req.files.coverImage[0].filename;

    await property.save({ validateBeforeSave: false });

    return res.status(StatusCodes.OK).json({
      status: "SUCCESS",
    });
  }
);

// @desc - Create a property
// @method = POST
// @route = /api/v1/properties
// @access = private

export const createPropertyHandler = catchAsyncHandler(
  async (req: Request, res: Response) => {
    // @ts-ignore
    const property = await createProperty({ ...req.body, user: req.user._id });

    return res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        property,
      },
    });
  }
);

// @desc = Get a single propertty
// @methot = GET
// @route = /api/v1/properties/:id
// @access = public

export const getSinglePropertyHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = get(req, "params");

    const property = await findAndPopulate({ _id: id }, "reviews");

    if (!property)
      return next(
        new RespondWithError(
          `There is not property with ${id} id`,
          StatusCodes.NOT_FOUND
        )
      );

    const key = `property-${id}`;

    await cacheResource(key, property);

    return res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        property: property,
      },
    });
  }
);

// @desc = Get all properties
// @method = GET
// @route = /api/v1/properties
export const getAllPropertiesHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const features = new ApiFeatures(Property.find(), req.query)
      .filter()
      .sort()
      .paginate()
      .select()
      .limit();

    // @ts-ignore
    const properties = await features.query;

    await cacheResource("properties", properties);

    return res.status(StatusCodes.OK).json({
      status: "success",
      // @ts-ignore
      total: properties.length,
      data: {
        properties: properties,
      },
    });
  }
);

//@desc = Delete a property
//@mthode = DELETE
//@Route = /api/v1/properties/:id
//@Access = Private

export const deletePropertyHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { id } = req.params;

    // @ts-ignore
    const userId = req.user._id;

    const property = await findProperty({ _id: id });

    if (!property)
      return next(
        new RespondWithError(`No property with that id`, StatusCodes.NOT_FOUND)
      );

    // @ts-ignore
    if (property.user.toString() !== userId.toString())
      return next(
        new RespondWithError(
          `You are not allowed to delete this property`,
          StatusCodes.NOT_FOUND
        )
      );

    await findPropertyAndDelete({ _id: id });

    res.status(StatusCodes.OK).json({
      status: "success",
    });
  }
);

// @desc - update property
// @method -  PUT,
// @route - /api/v1/properties
// @access - Private

export const updatePropertyHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = get(req, "params");
    const userId = get(req, "user._id");
    const update = req.body;

    if (update.title) {
      update.slug = slugify(update.title, { lower: true, strict: true });
    }

    const property = await findProperty({ _id: id });

    if (!property)
      return next(
        new RespondWithError(
          "There is no property with that id",
          StatusCodes.NOT_FOUND
        )
      );

    // @ts-ignore
    if (userId.toString() !== property.user.toString())
      return next(
        new RespondWithError(
          "You are not allowed to update this property",
          StatusCodes.UNAUTHORIZED
        )
      );

    const updatedProperty = await findPropertyAndUpdate({ _id: id }, update, {
      new: true,
    });

    return res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        property: updatedProperty,
      },
    });
  }
);
