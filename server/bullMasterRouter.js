import Router from "koa-router";
import bullMaster from "bull-master";
import basicAuth from "koa-basic-auth";
import dotenv from "dotenv";
import { orderCreatedQueue } from "./queueJobs";

dotenv.config();
const {
  QUEUE_MONITOR_USER,
  QUEUE_MONITOR_PASSWORD,
  QUEUE_MONITOR_PATH,
} = process.env;
const router = new Router();
router.all(
  `${QUEUE_MONITOR_PATH}(.*)`,
  basicAuth({ name: QUEUE_MONITOR_USER, pass: QUEUE_MONITOR_PASSWORD }),
  bullMaster.koa({
    queues: [orderCreatedQueue],
    prefix: QUEUE_MONITOR_PATH,
  })
);
export default router;
