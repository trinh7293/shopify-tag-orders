import { createBullBoard } from "@bull-board/api";
import { KoaAdapter } from "@bull-board/koa";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import Koa from "koa";
import basicAuth from "koa-basic-auth";
import mount from "koa-mount";
import dotenv from "dotenv";
import { bulkOperationFinishQueue } from "./messageQueue";
dotenv.config();

const {
  QUEUE_MONITOR_USER,
  QUEUE_MONITOR_PASSWORD,
  QUEUE_MONITOR_PATH,
} = process.env;

const queueMonitor = new Koa();

const serverAdapter = new KoaAdapter();

createBullBoard({
  queues: [new BullMQAdapter(bulkOperationFinishQueue)],
  serverAdapter,
});

const queueMonitorPath = QUEUE_MONITOR_PATH || "/admin/queues/";
const queueMonitorUser = QUEUE_MONITOR_USER || "user";
const queueMonitorPass = QUEUE_MONITOR_PASSWORD || "pass";
serverAdapter.setBasePath(queueMonitorPath);
queueMonitor
  .use(
    mount(
      queueMonitorPath,
      basicAuth({ name: queueMonitorUser, pass: queueMonitorPass })
    )
  )
  .use(serverAdapter.registerPlugin());

export default queueMonitor;
