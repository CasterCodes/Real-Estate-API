import Review, { ReviewInput, ReviewDocument } from "../models/reviews.model";
import { DocumentDefinition, FilterQuery, UpdateQuery } from "mongoose";

export const createReview = async (
  input: DocumentDefinition<ReviewDocument>
) => {
  return await Review.create(input);
};

export const getReviews = async (query: FilterQuery<ReviewDocument>) => {
  return await Review.find(query);
};

export const getReview = async (query: FilterQuery<ReviewDocument>) => {
  return await Review.findOne(query);
};

export const updateReview = async (
  id: FilterQuery<ReviewDocument["_id"]>,
  update: UpdateQuery<ReviewDocument>
) => {
  return await Review.findByIdAndUpdate(id, update);
};

export const deleteReview = async (id: FilterQuery<ReviewDocument["_id"]>) => {
  return await Review.findByIdAndDelete(id);
};
