import Shopify from "@shopify/shopify-api";
import { JobName } from "../constant";
import { bulkOperationFinishQueue } from "../messageQueue";

// TODO handler function bulkoperation finish
const handlerBulkOperationFinish = async (
  topic: string,
  shop: string,
  body: any
) => {
  console.log("handling BULK_OPERATIONS_FINISH webhook...");
  // TODO add to queue
  // const { url } = body;
  // bulkOperationFinishQueue.add(JobName.BULK_FINISH_JOB, { shop, url });
  // console.log(shop, url);
};

const switchHandler = (topic: string) => {
  if (topic === "BULK_OPERATIONS_FINISH") {
    return handlerBulkOperationFinish;
  }
  throw Error(`no handler for ${topic} webhook`);
};

const registerwebhook = async (
  shop: string,
  accessToken: string,
  topic: string
) => {
  try {
    const response = await Shopify.Webhooks.Registry.register({
      shop,
      accessToken,
      path: "/webhooks",
      topic,
      webhookHandler: switchHandler(topic),
    });
    console.log(`webhook ${topic} is registered`);
    if (!response.success) {
      throw Error(`Failed to register ${topic} webhook: ${response.result}`);
    }
  } catch (error) {
    throw Error(`Failed to register ${topic} webhook: ${error}`);
  }
};

// register list of webhooks when app installed
export const registerListWebhooks = async (
  shopName: string,
  accessToken: string
) => {
  // TODO complete
  const webhookTopics = ["BULK_OPERATIONS_FINISH"];
  const webhookRegisFncs = webhookTopics.map((topic) =>
    registerwebhook(shopName, accessToken, topic)
  );

  if (webhookRegisFncs.length) {
    await Promise.all(webhookRegisFncs).catch((error) => {
      console.error(error);
    });
  }
};
