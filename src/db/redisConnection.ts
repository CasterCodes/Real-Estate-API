import redis = require("redis");

import { REDIS_PORT, REDIS_URL } from "../config/config";

const client = redis.createClient({
  // @ts-ignore
  host: REDIS_URL,
  // @ts-ignore
  port: REDIS_PORT,
});

client.on("error", (error) => console.log({ error }));

client.on("ready", () => {
  let response = client.ping();

  console.log(response);
  // do other stuff
});

export default client;
