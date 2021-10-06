import Router from "koa-router";
import { receiveWebhook } from "@shopify/koa-shopify-webhooks";
const router = new Router({ prefix: "/webhook" });
import ApiNode from "shopify-api-node";
import { Worker, Queue } from "bullmq";

import dotenv from "dotenv";
import { mongoInstance } from "../../database/mongoInstance";
dotenv.config();

// init webhook validation
const webhook = receiveWebhook({ secret: process.env.SHOPIFY_API_SECRET });

// init queue job ny bullMq
const {
  CREATE_ORDER_WEBHOOK_QUEUE,
  CREATE_ORDER_JOB_NAME,
  REDIS_HOST,
  REDIS_PORT,
} = process.env;
// conection object
const redisConnection = {
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || "6379"),
};
// init task queue
const createOrderQueue = new Queue(CREATE_ORDER_WEBHOOK_QUEUE, {
  connection: redisConnection,
});

// init worker
const createOrderWorker = new Worker(
  CREATE_ORDER_WEBHOOK_QUEUE,
  async (job) => {
    try {
      console.log(`Processing job ${job.id} of type ${job.name}`);
      // get job data
      const { shopName, orderId, current_total_price } = job.data;

      // get settings data in mongo db
      await mongoInstance.connect();
      const shopData = await mongoInstance
        .db("test")
        .collection("shop")
        .findOne({ shop: shopName });
      const { accessToken, settings } = shopData;
      const { price, tag } = settings;

      // add tag to order if meet condition
      const shopifyClient = new ApiNode({
        shopName,
        accessToken,
      });
      if (Number(current_total_price) >= Number(price)) {
        shopifyClient.order.update(orderId, { tags: tag });
      }
    } catch (error) {
      console.log(`Failed to process job: ${job.id} of type ${job.name}`);
    }
  },
  { connection: redisConnection }
);

createOrderWorker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

// handle create order webhook
router.post("/orders/create", webhook, async (ctx) => {
  try {
    // get shop name from request
    const shopName = ctx.request.headers["x-shopify-shop-domain"];

    // get Order Id, total price
    const { id: orderId, current_total_price } = ctx.request.body;

    // add to queue
    ctx.body = "success";
    console.log(`Webhook create order processed, returned status code 200`);
    await createOrderQueue.add(CREATE_ORDER_JOB_NAME, {
      shopName,
      orderId,
      current_total_price,
    });
  } catch (error) {
    console.log(`Failed to process webhook: ${error}`);
  }
});

export default router;
