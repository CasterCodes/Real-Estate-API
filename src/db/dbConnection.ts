import mongoose from "mongoose";

import { MONGODB_PASSWORD, MONGODB_URL, DATABASE_NAME } from "../config/config";

// @ts-ignore
const mongoUrl: string = MONGODB_URL?.replace(
  "<password>",
  // @ts-ignore
  MONGODB_PASSWORD
).replace(
  "<databasename>", // @ts-ignore
  DATABASE_NAME
);

const connection = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to the database");
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

export default connection;
