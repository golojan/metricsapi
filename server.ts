import { config } from "dotenv";
config();

// import cluster from "node:cluster";
// import * as os from "os";
// const totalCPUs = os.cpus().length;

import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";

import schoolsRouter from "./routers/schools";
import homeRouter from "./routers/home";
import accountsRouter from "./routers/accounts";
import departmentsRouter from "./routers/departments";
import facultiesRouter from "./routers/faculties";
import lecturersRouter from "./routers/lecturers";
import studentsRouter from "./routers/students";
import openaiRouter from "./routers/metrics";

// if (cluster.isPrimary) {
//   console.log(`Primary ${process.pid} is running`);
//   // Fork workers.
//   for (let i = 0; i < totalCPUs; i++) {
//     cluster.fork();
//   }
//   cluster.on("listening", (address: object) => {
//     // Worker is listening
//     console.log(`Worker is listening on ${address}`);
//   });
//   cluster.on("exit", (worker, code: number, signal: string) => {
//     if (signal) {
//       console.log(`worker was killed by signal: ${signal}`);
//     } else if (code !== 0) {
//       console.log(`worker exited with error code: ${code}`);
//     } else {
//       console.log("worker success!");
//     }
//     console.log("Forking a new Worker.....");
//     cluster.fork();
//   });
//   cluster.on("disconnect", () => {
//     // Worker has disconnected
//     console.log("Worker has disconnected");
//   });
// } else {
// }

const server: Express = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const allowedOrigins: string[] = [
  "https://api.metrics.ng",
  "https://api.metrics.ng/",
  "https://app.metrics.ng",
  "https://app.metrics.ng/",
  "https://esut.metrics.ng",
  "https://esut.metrics.ng/",
  "https://owner.metrics.ng",
  "https://owner.metrics.ng/",
  "https://metrics.ng",
  "https://metrics.ng/",
  "http://localhost:4200",
  "http://localhost:4200/",
];

server.use(
  cors({
    optionsSuccessStatus: 200,
    origin: "*",
    methods: "POST, GET",
  })
);

server.use(
  helmet({
    contentSecurityPolicy: false,
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
