import mongoose from "mongoose";

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connection is successful");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

export default connect;
