const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING, {
      dbName: "pet_shop",
    });
    console.log("Database Connection is ready....");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

module.exports = connectDB;
