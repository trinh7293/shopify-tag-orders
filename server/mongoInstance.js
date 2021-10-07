import mongo from "koa-mongo";
require("dotenv").config();

const { MONGODB_URL, MONGODB_POOL_MAX, MONGODB_POOL_MIN } = process.env;

const ctx = {};
export const connectToMongoDb = async () => {
  await mongo({
    uri: MONGODB_URL,
    max: MONGODB_POOL_MAX,
    min: MONGODB_POOL_MIN,
    acquireTimeoutMillis: 20000,
  })(ctx, async () => {});
  return ctx;
};
