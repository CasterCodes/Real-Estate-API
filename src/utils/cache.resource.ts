import util from "util";
import client from "../db/redisConnection";

export const cacheResource = async (key: string, value: any) => {
  // @ts-ignore
  client.setex = util.promisify(client.setex);
  // @ts-ignore
  await client.setex(key, 1000, JSON.stringify(value));
};
