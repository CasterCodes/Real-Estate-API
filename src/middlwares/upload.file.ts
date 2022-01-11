import multer from "multer";
import sharp from "sharp";
import RespondWithError from "../utils/error.utils";

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, `uploads/images`);
  },
  filename: (req, file, callback) => {
    // @ts-ignore
    const id = req.params.id ? req.params.id : req.user._id;

    const baseName = req.params.id ? "property" : "user";

    const fileExtenion = file.mimetype.split("/")[1];

    callback(null, `${baseName}-${id}-${Date.now()}.${fileExtenion}`);
  },
});

// @ts-ignore
const filter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(
      new RespondWithError(
        "You are tring to upload a file that is not an image",
        400
      )
    );
  }
};

const upload = multer({ storage: storage, fileFilter: filter });

export const uploadPropertyImagesMiddleware = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "coverImage", maxCount: 1 },
]);

export const uploadUserProfileImage = upload.single("photo");
