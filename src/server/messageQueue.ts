import { Worker, Queue } from "bullmq";
import bulkImportFinishProcessor from "./processors/bulkImportFinishProcessor";
import { QueueName } from "./constant";
import dotenv from "dotenv";
dotenv.config();

// init queue job ny bullMq
const { REDIS_HOST, REDIS_PORT } = process.env;
// conection object
const redisConnection = {
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || "6379"),
};
// init task queue
export const bulkOperationFinishQueue = new Queue(QueueName.BULK_FINISH_QUEUE, {
  connection: redisConnection,
});

// init worker
const bulkImportFinishWorker = new Worker(
  QueueName.BULK_FINISH_QUEUE,
  bulkImportFinishProcessor,
  { connection: redisConnection }
);
bulkImportFinishWorker.on("completed", (job) => {
  console.log(`job name ${job.name} with id: ${job.id} has completed!`);
});
