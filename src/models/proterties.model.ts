import mongoose from "mongoose";
import slugify from "slugify";
import { UserDocument } from "./user.model";

export interface PropertyDocument extends mongoose.Document {
  user: UserDocument["_id"];
  title: string;
  price: number;
  slug: string;
  listedIn: string;
  category: string;
  description: string;
  address?: {
    code?: string;
    county?: string;
    town?: string;
  };
  location?: {
    longitude: string;
    latitude: string;
  };
  images: [name: string];
  coverImage: string;
  numRooms?: number;
  bedRooms?: number;
  bathRooms?: number;
  structureType?: string;
}

const propertySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Property has to have a title"],
    },
    slug: {
      type: String,
      required: [true, "Property needs a slug"],
      unique: [true, "Slug has to be  unique"],
    },

    price: {
      type: Number,
      required: [true, "Property needs price"],
    },

    description: {
      type: String,
      required: [true, "A property description is required"],
    },

    listedIn: {
      type: String,
      required: [true, "ListedIn is required"],
      enum: {
        values: ["Rentals", "Sales"],
        message: "Only Rentals and Sales is required",
      },
    },
    categories: {
      type: String,
      requied: [true, "A property requires a category"],
      enum: {
        values: ["Apartment", "House", "Land"],
        message: "Only apartment, house, and land is required",
      },
    },

    address: {
      code: {
        type: String,
      },
      county: {
        type: String,
      },
      town: {
        type: String,
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, "Rating should not be more than 5"],
      min: [1, "Rating should not me less than 1"],
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingsTotal: {
      type: Number,
      default: 0,
    },

    location: {
      longtitude: {
        type: String,
      },
      latitude: {
        type: String,
      },
    },
    images: [String],
    coverImage: {
      type: String,
    },
    numRooms: {
      type: Number,
    },
    bedRooms: {
      type: Number,
    },
    bathRooms: {
      type: Number,
    },
    structureType: {
      type: String,
      enum: {
        values: ["Brick", "Wood", "Cement"],
        message: "Only Brick, Wood, and Cement are required",
      },
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

propertySchema.pre("validate", async function (next) {
  let property = this as PropertyDocument;

  if (property.title)
    property.slug = slugify(property.title, { lower: true, strict: true });

  next();
});

// query middleware to populate the user

propertySchema.pre(/^find/, function (next) {
  let property = this as PropertyDocument;

  property.populate({
    path: "user",
    select: "-password -role -__v",
  });

  next();
});

// virtual populate
propertySchema.virtual("reviews", {
  ref: "Review",
  foreignField: "property",
  localField: "_id",
  justOnce: true,
});

const Property = mongoose.model<PropertyDocument>("Property", propertySchema);

export default Property;
