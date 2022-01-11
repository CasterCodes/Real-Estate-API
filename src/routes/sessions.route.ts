import express from "express";
import {
  createUserSessionHandler,
  inValidateUserAccessTokenHandler,
  getUserSessionsHandler,
} from "../controllers/session.controller";
import { authorize } from "../middlwares/authorize";
import { protect } from "../middlwares/protect";

const router = express.Router();

router
  .route("/")
  .post(createUserSessionHandler)
  .put(
    protect,
    authorize(["agent", "user", "admin"]),
    inValidateUserAccessTokenHandler
  )
  .get(protect, authorize(["agent", "user", "admin"]), getUserSessionsHandler);

export default router;
