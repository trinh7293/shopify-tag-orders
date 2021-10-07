import { mongoInstance } from "../../database/mongoInstance";
import ApiNode from "shopify-api-node";

const processor = async (job) => {
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
};

export default processor;
