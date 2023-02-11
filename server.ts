import { config } from "dotenv";
config();


import express, { Express } from "express";
import cors from "cors";
// import helmet from "helmet";

import schoolsRouter from "./routers/schools";
import homeRouter from "./routers/home";
import accountsRouter from "./routers/accounts";
import departmentsRouter from "./routers/departments";
import facultiesRouter from "./routers/faculties";
import lecturersRouter from "./routers/lecturers";
import studentsRouter from "./routers/students";
import openaiRouter from "./routers/metrics";

const server: Express = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const allowedOrigins: string[] = [
  "https://api.metrics.ng",
  "https://app.metrics.ng",
  "https://esut.metrics.ng",
  "https://owner.metrics.ng",
  "https://metrics.ng",
  "http://localhost:4200",
];

server.use(
  cors({
    optionsSuccessStatus: 200,
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  })
);

server.use("/schools", schoolsRouter);
server.use("/accounts", accountsRouter);
server.use("/faculties", facultiesRouter);
server.use("/departments", departmentsRouter);
server.use("/lecturers", lecturersRouter);
server.use("/students", studentsRouter);
server.use("/metrics", openaiRouter);
server.use("/", homeRouter);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Running: http://localhost:${port}`);
});

