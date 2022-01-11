import express, { Application, Request, Response, NextFunction } from "express";
require("dotenv").config();
import { get } from "lodash";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import RespondWithError from "./utils/error.utils";
import globalErrorHandler from "./middlwares/error";
import connection from "./db/dbConnection";
import authRouter from "./routes/auth.route";
import sessionsRouter from "./routes/sessions.route";
import propertiesRouter from "./routes/properties.route";
import reviewsRouter from "./routes/reviews.route";
import usersRouter from "./routes/users.route";
import cookieParser from "cookie-parser";
// process.env.NODE_ENV = "development";

process.on("uncaughtException", (error) => {
  console.log("Unhandled Exception. Shutting down....");
  console.log({
    error,
    message: get(error, "message"),
    name: get(error, "name"),
  });
});

const app: Application = express();

const PORT: string | number = process.env.PORT || 3000;

app.enable("trust proxy");

app.use(cookieParser());

app.use(cors());

app.set("trust proxy", 1);

app.enable("trust proxy");

// http securiy headers
app.use(helmet());

app.use(express.json());

app.use(mongoSanitize());

app.use(hpp({}));

app.use(compression());

app.get("/api/v1/test", (req: Request, res: Response, next: NextFunction) => {
  console.log("Running");
  res.send("Real estate website");
});

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/sessions", sessionsRouter);

app.use("/api/v1/properties", propertiesRouter);

app.use("/api/v1/reviews", reviewsRouter);

app.use("/api/v1/users", usersRouter);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new RespondWithError(`This ${req.originalUrl} was not found`, 404));
});

app.use(globalErrorHandler);

let server: any;

const startApp = (port: number | string) => {
  server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  connection();
};

startApp(PORT);

process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection. Shutting down....");

  console.log({
    error,
    message: get(error, "message"),
    name: get(error, "name"),
  });

  server.close(() => {
    process.exit(1);
  });
});
