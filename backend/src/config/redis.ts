import IORedis from "ioredis";
import { env } from "./env";

export const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
}) as any;

export const cacheRedis = new IORedis(env.REDIS_URL);
