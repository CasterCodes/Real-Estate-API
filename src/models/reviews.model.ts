import mongoose from "mongoose";
import { findPropertyAndUpdate } from "../services/properties.services";
import { PropertyDocument } from "./proterties.model";
import { UserDocument } from "./user.model";

export interface ReviewInput {
  rating: number;
  comment: string;
}

export interface ReviewDocument extends ReviewInput, mongoose.Document {
  property: PropertyDocument["_id"];
  user: UserDocument["_id"];
}

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "User rating is required"],
    },

    comment: {
      type: String,
      required: [true, "Rating comment is required"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// User should write one  review

reviewSchema.index({ property: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  let review = this as ReviewDocument;

  review.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

reviewSchema.statics.calculateAverageRatings = async function (
  propertyId: PropertyDocument["_id"]
) {
  let review = this;

  const stats = await review.aggregate([
    {
      $match: { property: propertyId },
    },
    {
      $group: {
        _id: "$property",
        totalRatings: { $sum: 1 },
        ratingsAverage: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await findPropertyAndUpdate(
      { _id: propertyId },
      {
        ratingsAverage: stats[0].ratingsAverage,
        ratingsTotal: stats[0].totalRatings,
      },
      { lean: false }
    );
  } else {
    await findPropertyAndUpdate(
      { _id: propertyId },
      {
        ratingsAverage: 4.5,
        ratingsTotal: 0,
      },
      { lean: false }
    );
  }
};

reviewSchema.post("save", function () {
  this.constructor.calculateAverageRatings(this.property);
});

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.review = await this.findOne();

//   console.log({ current: this.current });

//   next();
// });

// reviewSchema.post(/^findOneAnd/, async function (docs, next) {
//   this.review.contructor.calculateAverageRatings(this.review.property);
// });

const Review = mongoose.model<ReviewDocument>("Review", reviewSchema);

export default Review;
