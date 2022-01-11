import { Request, Response, NextFunction } from "express";
import util from "util";
import { get } from "lodash";
import { StatusCodes } from "http-status-codes";
import client from "../../db/redisConnection";

export const getCachedResourceHandler =
  (resource: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = get(req, "params");

    // @ts-ignore
    client.get = util.promisify(client.get);

    const resourceId = `${resource}-${id}`;

    // @ts-ignore
    const result = JSON.parse(await client.get(resourceId));

    if (!result) return next();

    let obj = {};

    // @ts-ignore
    obj[resource] = result;

    return res.status(StatusCodes.OK).json({
      status: "success",
      data: obj,
    });
  };

export const getAllCachedResourceHandler =
  (resource: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = get(req, "params");

    // @ts-ignore
    client.get = util.promisify(client.get);

    // @ts-ignore
    const result = JSON.parse(await client.get(resource));

    if (!result) return next();

    let obj = {};

    // @ts-ignore
    obj[resource] = result;

    return res.status(StatusCodes.OK).json({
      status: "success",
      total: result.length,
      data: obj,
    });
  };
