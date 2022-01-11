import express, { Router } from "express";
import {
  getAllUsersHandler,
  getUsersHandler,
  deleteUserHandler,
  updateUserHandler,
  uploadUserProfileImageHandler,
} from "../controllers/user.controller";
import { authorize } from "../middlwares/authorize";
import { protect } from "../middlwares/protect";
import {
  getAllCachedResourceHandler,
  getCachedResourceHandler,
} from "../middlwares/redis/resource.cached";
import { uploadUserProfileImage } from "../middlwares/upload.file";

const router: Router = express.Router();

router
  .route("/")
  .get(
    protect,
    authorize(["admin"]),
    getAllCachedResourceHandler("users"),
    getAllUsersHandler
  );
router
  .route("/:id")
  .get(
    protect,
    authorize(["admin"]),
    getCachedResourceHandler("user"),
    getUsersHandler
  )
  .delete(protect, authorize(["admin"]), deleteUserHandler)
  .put(protect, authorize(["admin", "user", "agent"]), updateUserHandler);

router
  .route("/user/profile-image")
  .put(
    protect,
    authorize(["admin", "user", "agent"]),
    uploadUserProfileImage,
    uploadUserProfileImageHandler
  );

export default router;
