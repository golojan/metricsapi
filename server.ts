import { config } from "dotenv";
config();
import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";

import apiRouter from "./routers/api.router";

const server: Express = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "public")));

server.use("/api", apiRouter);

server.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello World" });
});

const port = process.env.PORT || 3000;
const { MONGOOSE_URI } = process.env;
server.listen(port, () => {
  console.log(`Running: http://localhost:${port} ${MONGOOSE_URI}`);
});
