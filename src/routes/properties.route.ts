import express, { Router } from "express";
import {
  createPropertyHandler,
  deletePropertyHandler,
  getAllPropertiesHandler,
  getSinglePropertyHandler,
  updatePropertyHandler,
  uploadPropertyImagesHandler,
} from "../controllers/properties.controller";
import { uploadPropertyImagesMiddleware } from "../middlwares/upload.file";
import reviewRouter from "./reviews.route";
import { protect } from "../middlwares/protect";
import { authorize } from "../middlwares/authorize";
import {
  getCachedResourceHandler,
  getAllCachedResourceHandler,
} from "../middlwares/redis/resource.cached";

const router: Router = express.Router();

router.use("/:propertyId/reviews", reviewRouter);

// @ts-ignore
router
  .route("/")
  .post(protect, authorize(["admin", "agent"]), createPropertyHandler)
  .get(getAllCachedResourceHandler("properties"), getAllPropertiesHandler);

router
  .route("/upload-images/:id")
  .put(
    protect,
    authorize(["admin", "agent"]),
    uploadPropertyImagesMiddleware,
    uploadPropertyImagesHandler
  );

router
  .route("/:id")
  .get(getCachedResourceHandler("property"), getSinglePropertyHandler)
  .delete(protect, authorize(["agent", "admin"]), deletePropertyHandler)
  .put(protect, authorize(["admin", "agent"]), updatePropertyHandler);

export default router;
