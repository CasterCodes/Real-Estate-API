import { Request, Response, ErrorRequestHandler, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { get } from "lodash";
import RespondWithError from "../utils/error.utils";

const globalErrorHandler = (
  error: ErrorRequestHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  error.statusCode = error.statusCode || 500;
  // @ts-ignore
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "production") {
    let err = { ...error };

    const errorName = error.name;

    const errorCode = get(error, "code");

    if (errorName === "CastError") err = handleCastError(err);

    if (errorCode === 11000) err = handleDuplicateVlaueErrorDB(err);

    if (errorName === "ValidationError") err = handleValidationErrorDB(err);

    // @ts-ignore
    sendProductionError(err, res);
  } else if (process.env.NODE_ENV === "development") {
    sendDevelopmentError(error, res);
  }
};

const sendDevelopmentError = (error: ErrorRequestHandler, res: Response) => {
  res.status(get(error, "statusCode")).json({
    status: get(error, "status"),
    message: get(error, "message"),
    error: error,
    stack: get(error, "stack"),
  });
};

const sendProductionError = (error: ErrorRequestHandler, res: Response) => {
  const isOperational = get(error, "isOperational");

  if (isOperational) {
    res.status(get(error, "statusCode")).json({
      status: get(error, "status"),
      message: get(error, "message"),
    });
  } else {
    res.status(get(error, "statusCode")).json({
      status: "error",
      message: "It seems like somethig went wrong",
    });
  }
};

const handleCastError = (error: any) => {
  const errorPath = get(error, "path");

  const errorValue = get(error, "value");

  return new RespondWithError(
    `Invalid ${errorPath}-${errorValue}`,
    StatusCodes.BAD_REQUEST
  );
};

const handleDuplicateVlaueErrorDB = (err: any) => {
  return new RespondWithError(
    `Trying to submit duplicate value`,
    StatusCodes.BAD_REQUEST
  );
};

const handleValidationErrorDB = (err: any) => {
  return new RespondWithError(
    "Please make sure all the fields are correct",
    StatusCodes.BAD_REQUEST
  );
};
export default globalErrorHandler;
