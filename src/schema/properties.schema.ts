import { object, string, ref } from "yup";

export const propertySchema = object({
  body: object({
    title: string().required("Property title is required"),
  }),
});
