import { Request, Response, NextFunction } from "express";

const catchAsyncHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    fn(req, res, next).catch((error) => next(error));
  };

export default catchAsyncHandler;
