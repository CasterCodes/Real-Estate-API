import { string, object, ref } from "yup";

export const forgotPasswordSchema = object({
  body: object({
    email: string()
      .email("Provide a valid email")
      .required("User email is required"),
  }),
});

export const resetPasswordSchema = object({
  body: object({
    password: string().required("Password is required"),
    confirmPassword: string().oneOf(
      [ref("password")],
      "Passwords do not match"
    ),
  }),
  params: object({
    token: string().required(),
  }),
});
