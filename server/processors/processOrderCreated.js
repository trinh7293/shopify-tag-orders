import ApiNode from "shopify-api-node";
import { connectToMongoDb } from "../mongoInstance";

const processor = async (job) => {
  try {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    // get job data
    const { shopName, orderId, current_total_price } = job.data;

    // get settings data in mongo db
    // await mongoInstance.connect();
    const context = {};
    await connectToMongoDb(context);
    const shopData = await context.db
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
    console.log(
      `Failed to process job: ${job.id} of type ${job.name} with error: ${error}`
    );
  }
};

export default processor;
