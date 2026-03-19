import IORedis from "ioredis";
import { env } from "./env";

export const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
}) as any;

export const cacheRedis = new IORedis(env.REDIS_URL);

export const redisPub = new IORedis(env.REDIS_URL);
export const redisSub = new IORedis(env.REDIS_URL);
