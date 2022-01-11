import express from "express";
import { protect } from "../middlwares/protect";
import { authorize } from "../middlwares/authorize";
const router = express.Router();
import {
  userSignupHandler,
  confirmUserEmailHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  changePasswordHandler,
  getMeHandler,
  confirmUserPhoneNumberHandler,
} from "../controllers/auth.controller";

import validateRequest from "../middlwares/validateRequest";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schema/auth.schema";

router.route("/signup").post(userSignupHandler);

router.route("/confirm-email/:token").get(confirmUserEmailHandler);

router
  .route("/forgot-password")
  .post(validateRequest(forgotPasswordSchema), forgotPasswordHandler);
router
  .route("/reset-password/:token")
  .get(validateRequest(resetPasswordSchema), resetPasswordHandler);

router.route("/confirm-phone-number").post(confirmUserPhoneNumberHandler);

router
  .route("/change-password")
  .post(protect, authorize(["user", "agent", "admin"]), changePasswordHandler);

router
  .route("/me")
  .get(protect, authorize(["user", "agent", "admin"]), getMeHandler);

export default router;
