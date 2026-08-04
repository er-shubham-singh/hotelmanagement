import { v2 as cloudinary } from "cloudinary";
import { config } from "./env.js";

// Optional, like Razorpay/Firebase elsewhere in this app — leave the env vars
// blank to keep using local disk storage (see uploadHotelImages), or set them
// to upload hotel photos to Cloudinary and store the returned secure URL.
export const isCloudinaryConfigured = Boolean(
  config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

export const uploadBufferToCloudinary = (buffer, folder = "staybyhour/hotels") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

export default cloudinary;
