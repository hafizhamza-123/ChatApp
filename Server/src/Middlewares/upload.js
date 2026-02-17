import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloundinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resourceType = "auto";

    return {
      folder: "ChatApp",
      resource_type: resourceType,
      allowed_formats: [
        "jpg", "png", "jpeg",
        "pdf", "doc", "docx",
        "mp3", "wav", "m4a", "mp4"
      ]
    };
  }
});

const upload = multer({ storage });

export default upload;
