import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const generationQueue = new Queue("question-generation", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
  },
});
