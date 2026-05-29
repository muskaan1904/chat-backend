import mongoose from "mongoose";
import dotenv from "dotenv";
import Auth from "./api/models/auth.schema.js";

dotenv.config();

console.log("MONGO_URL:", process.env.MONGO_URL);

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected successfully to MongoDB!");
    
    const count = await Auth.countDocuments({});
    console.log("Number of auth documents:", count);
    
    // Find one
    const one = await Auth.findOne({});
    console.log("One user:", one);
  } catch (err) {
    console.error("Error occurred:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
