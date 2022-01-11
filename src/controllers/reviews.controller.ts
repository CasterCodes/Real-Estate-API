import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { get } from "lodash";
import { ReviewDocument } from "../models/reviews.model";
import {
  createReview,
  getReview,
  getReviews,
  updateReview,
  deleteReview,
} from "../services/reviews.services";
import catchAsyncHandler from "../utils/catchAsync.utils";
import RespondWithError from "../utils/error.utils";

export const createReviewHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rating, comment } = get(req, "body");

    const property = get(req, "params.propertyId");

    const user = get(req, "user._id");

    const userHasCreatedReview = await getReview({ user });

    if (userHasCreatedReview)
      return next(
        new RespondWithError(
          "You have already created a review for this property",
          StatusCodes.BAD_REQUEST
        )
      );

    const userReview = {
      property,
      user,
      rating,
      comment,
    };

    const review = await createReview(userReview);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        review,
      },
    });
  }
);

export const getReviewsHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const property = get(req, "params.propertyId");

    const reviews = await getReviews({ property });

    res.status(StatusCodes.OK).json({
      status: "success",
      total: reviews.length,
      data: {
        reviews,
      },
    });
  }
);

const isUserCreator = async (
  id: ReviewDocument["_id"],
  req: Request
): Promise<Boolean> => {
  const reviewBeforeUpdate = await getReview({ _id: id });

  if (!reviewBeforeUpdate) return false;

  const userId = get(req, "user._id").toString();

  const reviewCreatorId = get(reviewBeforeUpdate, "user._id").toString();

  if (userId !== reviewCreatorId) return false;

  return true;
};

export const updateReviewHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = get(req, "params.id");

    const isUser = await isUserCreator(reviewId, req);

    if (!isUser)
      return next(
        new RespondWithError(
          "Not allowed to update this review",
          StatusCodes.FORBIDDEN
        )
      );

    const review = await updateReview(reviewId, req.body);

    return res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        review,
      },
    });
  }
);

export const deleteReviewHandler = catchAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = get(req, "params.id");

    const isUser = await isUserCreator(reviewId, req);

    if (!isUser)
      return next(
        new RespondWithError(
          "You cant delete this review",
          StatusCodes.FORBIDDEN
        )
      );

    await deleteReview(reviewId);

    return res.status(StatusCodes.OK).json({
      status: "success",
    });
  }
);
