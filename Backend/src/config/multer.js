import multer from "multer";

// Buffers in memory rather than writing to disk directly — uploadHotelImages
// then either streams the buffer to Cloudinary (if configured) or writes it
// to local disk itself. This is the only place `upload` is used.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WEBP, or AVIF images are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
