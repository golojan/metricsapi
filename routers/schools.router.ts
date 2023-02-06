// api routes
import { Router, Request, Response, NextFunction } from "express";
const schoolsRouter = Router();

schoolsRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Hello API!");
});

export default schoolsRouter;
