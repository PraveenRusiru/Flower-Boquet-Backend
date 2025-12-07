import { createClient,RedisClientType } from "redis";
import dotenv from "dotenv";
dotenv.config();

let client: RedisClientType | null = null;
let connecting = false;

export const getRedisClient = async (): Promise<RedisClientType> => {
  // create client once
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    client.on("error", (err) => {
      console.error("Redis Client Error", err);
    });
  }

  // if already open, just return it
  if (client.isOpen) {
    return client;
  }

  // if a connect() is already in progress, wait for it
  if (connecting) {
    while (!client.isOpen) {
      await new Promise((r) => setTimeout(r, 10));
    }
    return client;
  }

  // first caller actually connects
  connecting = true;
  await client.connect();
  connecting = false;

  return client;
};
