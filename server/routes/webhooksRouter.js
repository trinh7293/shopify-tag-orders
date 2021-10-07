import Router from "koa-router";
import { receiveWebhook } from "@shopify/koa-shopify-webhooks";
import dotenv from "dotenv";
import { orderCreatedQueue } from "../queueJobs";
dotenv.config();
const router = new Router({ prefix: "/webhook" });

// init job name to add to queue
const { CREATE_ORDER_JOB_NAME } = process.env;

// init webhook validation
const webhook = receiveWebhook({ secret: process.env.SHOPIFY_API_SECRET });

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
    await orderCreatedQueue.add(CREATE_ORDER_JOB_NAME, {
      shopName,
      orderId,
      current_total_price,
    });
  } catch (error) {
    console.log(`Failed to process webhook: ${error}`);
  }
});

export default router;
