import Router from "koa-router";
import { verifyRequest } from "@shopify/koa-shopify-auth";
import api2 from "shopify-api-node";
const router = new Router({ prefix: "/settings" });

// save settings to mongo db
router.post("/save-settings", verifyRequest(), async (ctx) => {
  const { price, tag, shop } = ctx.request.body;
  ctx.db.collection("shop").updateOne(
    { shop },
    {
      $set: {
        settings: {
          price,
          tag,
        },
      },
    }
  );
  ctx.body = "success";
});

// get settings from mongo db
router.get("/get-settings", verifyRequest(), async (ctx) => {
  const { shop } = ctx.request.query;
  const shopData = await ctx.db.collection("shop").findOne({ shop });
  ctx.body = shopData.settings;
});

export default router;
