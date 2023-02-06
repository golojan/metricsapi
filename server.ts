import { config } from "dotenv";
config();
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";

import apiRouter from "./routers/api.router";

const server: Express = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(
  cors({
    origin: "metrics.ng",
  })
);

server.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

server.use("/api", apiRouter);

server.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello World" });
});

const port = process.env.PORT || 3000;
const { MONGOOSE_URI } = process.env;
server.listen(port, () => {
  console.log(`Running: http://localhost:${port}`);
});
