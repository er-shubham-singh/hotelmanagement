import mongoose from "mongoose";
import { config } from "./env.js";

export const connectDB = async () => {
  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(config.mongoUri);
    // eslint-disable-next-line no-console
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[db] MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
