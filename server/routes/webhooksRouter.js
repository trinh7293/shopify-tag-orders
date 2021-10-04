import Router from "koa-router";
import { receiveWebhook } from "@shopify/koa-shopify-webhooks";
const router = new Router({ prefix: "/webhook" });
import ApiNode from "shopify-api-node";
import dotenv from "dotenv";
dotenv.config();

const webhook = receiveWebhook({ secret: process.env.SHOPIFY_API_SECRET });

// handle create order webhook
router.post("/orders/create", webhook, async (ctx) => {
  try {
    // get shop name from request
    const shopName = ctx.request.headers["x-shopify-shop-domain"];

    // get shopdata in mongo db
    const shopData = await ctx.db
      .collection("shop")
      .findOne({ shop: shopName });
    const { accessToken, settings } = shopData;

    // setup shopify client
    const client = new ApiNode({
      shopName,
      accessToken,
    });

    // get Order Id, total price
    const { id: orderId, current_total_price } = ctx.request.body;

    // check set tag condition
    const { price, tag } = settings;
    if (Number(current_total_price) >= Number(price)) {
      client.order.update(orderId, { tags: tag });
    }
    ctx.body = "success";
    console.log(`Webhook create order processed, returned status code 200`);
  } catch (error) {
    console.log(`Failed to process webhook: ${error}`);
  }
});

export default router;
