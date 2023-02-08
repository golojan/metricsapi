/**
 * @api {post} Connections
 * @apiName Connections
 * @apiGroup Connections
 * @apiVersion 1.0.0
 * @apiDescription List Connections
 */

import { dbCon } from "../models";
import { Router, Request, Response } from "express";
const connectionsRouter = Router();

connectionsRouter.all("/", (req: Request, res: Response) => {
  res.send({
    status: false,
    error: "Invalid API GET call",
  });
});

connectionsRouter.get("/list", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { Connections } = await dbCon();
  const connection = await Connections.find({}).catch(catcher);
  if (connection) {
    res.status(200).json({
      status: true,
      data: connection,
    });
  } else {
    res.status(404).json({ status: false, err: "Connections not found" });
  }
});
