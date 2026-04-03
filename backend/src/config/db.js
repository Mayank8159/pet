const mongoose = require("mongoose");

async function connectDb() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set or is invalid. Add a valid MongoDB Atlas URI to your .env file.");
  }

  await mongoose.connect(uri, {
    dbName: undefined,
  });

  return mongoose.connection;
}

module.exports = {
  connectDb,
};
