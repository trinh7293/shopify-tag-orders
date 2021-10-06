import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const { MONGO_URL } = process.env;

export const mongoInstance = new MongoClient(MONGO_URL);
