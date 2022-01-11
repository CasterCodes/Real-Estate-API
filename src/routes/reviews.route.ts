import express, { Router } from "express";
import {
  createReviewHandler,
  deleteReviewHandler,
  getReviewsHandler,
  updateReviewHandler,
} from "../controllers/reviews.controller";
import { authorize } from "../middlwares/authorize";
import { protect } from "../middlwares/protect";
import validateRequest from "../middlwares/validateRequest";
import { getReviewsSchema } from "../schema/review.schema";

const router: Router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(protect, authorize(["user"]), createReviewHandler)
  .get(validateRequest(getReviewsSchema), getReviewsHandler);

router
  .route("/:id")
  .put(protect, authorize(["user"]), updateReviewHandler)
  .delete(protect, authorize(["user"]), deleteReviewHandler);

export default router;
