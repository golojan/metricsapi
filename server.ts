import { config } from "dotenv";
config();
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { dbCon } from "./models";

import schoolsRouter from "./routers/schools";
import homeRouter from "./routers/home";

const server: Express = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const allowedOrigins: string[] = [
  "https://esut.metrics.ng",
  "https://owner.metrics.ng",
  "https://metrics.ng",
];

server.use(
  cors({
    optionsSuccessStatus: 200,
    credentials: true,
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

server.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

server.use("/schools", schoolsRouter);
server.use("/", homeRouter);

const port = process.env.PORT || 3000;
const { MONGOOSE_URI } = process.env;
server.listen(port, () => {
  console.log(`Running: http://localhost:${port}`);
});
