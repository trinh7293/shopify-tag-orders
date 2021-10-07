import { Worker, Queue } from "bullmq";
import orderCreatedProcessor from "./processors/processOrderCreated";
import dotenv from "dotenv";
dotenv.config();

// init queue job ny bullMq
const { ORDER_CREATED_WEBHOOK_QUEUE, REDIS_HOST, REDIS_PORT } = process.env;
// conection object
const redisConnection = {
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || "6379"),
};
// init task queue
export const orderCreatedQueue = new Queue(ORDER_CREATED_WEBHOOK_QUEUE, {
  connection: redisConnection,
});

// init worker
const createOrderWorker = new Worker(
  ORDER_CREATED_WEBHOOK_QUEUE,
  orderCreatedProcessor,
  { connection: redisConnection }
);

createOrderWorker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});
