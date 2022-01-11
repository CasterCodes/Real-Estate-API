import { object, string, number } from "yup";

export const createReviewSchema = object({
  body: object({
    rating: number()
      .required("Property rating is required")
      .max(5, "A maximum of  5 stars is required")
      .min(0.5, "Only a minimum of half a star is required"),
    comment: string().required("Property rating requires a comment"),
  }),
});

export const getReviewsSchema = object({
  params: object({
    propertyId: string().required("Property id you the reviews is required"),
  }),
});
