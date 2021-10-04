import { verifyRequest } from "@shopify/koa-shopify-auth";
import Router from "koa-router";
const router = new Router({ prefix: "/orders" });
import ApiNode from "shopify-api-node";

router.get("/", verifyRequest(), async (ctx) => {
  const { tag, limit, cursor, shop, direction } = ctx.request.query;
  const shopData = await ctx.db.collection("shop").findOne({ shop });
  const { accessToken } = shopData;
  // setup shopify client
  const client = new ApiNode({
    shopName: shop,
    accessToken,
  });
  const query = typeof tag === "string" ? `query: "tag:${tag}"` : "";
  const first = direction === "after" ? "first" : "last";
  const data = await client.graphql(
    `query ($limit: Int!, $cursor: String){
                orders(${first}: $limit, ${query} ${direction}:$cursor) {
                        pageInfo {
                            hasNextPage
                            hasPreviousPage
                        }
                        edges {
                            cursor
                            node {
                                name,
                                totalPriceSet { presentmentMoney { amount } },
                                createdAt
                                tags
                            }
                        }
                }
            }`,
    {
      limit: Number(limit),
      cursor,
    }
  );
  ctx.body = data;
});

export default router;
