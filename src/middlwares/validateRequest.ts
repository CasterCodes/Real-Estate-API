import { AnySchema } from "yup";
import { Response, Request, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsyncHandler from "../utils/catchAsync.utils";

const validateRequest = (schema: AnySchema) =>
  catchAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });

export default validateRequest;
