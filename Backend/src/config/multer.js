import multer from "multer";

// Buffers in memory rather than writing to disk directly — uploadHotelImages
// then either streams the buffer to Cloudinary (if configured) or writes it
// to local disk itself. This is the only place `upload` is used.
const storage = multer.memoryStorage();

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

// Field-aware filter — "images" must be an image, "video" must be a video.
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "video") {
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Only MP4, WebM, or MOV videos are allowed"));
  }
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
  return cb(new Error("Only JPEG, PNG, WEBP, or AVIF images are allowed"));
};

// Shared instance — 50MB covers a short hotel walkthrough video; images are
// filtered/capped separately in the controller (max 5 total).
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export default upload;
