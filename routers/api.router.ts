// api routes
import { Router, Request, Response, NextFunction } from "express";
import { getAccounts } from "../controllers/accounts.controller";
const apiRouter = Router();

apiRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Hello API!");
});

apiRouter.get(
  "/accounts",
  async (req: Request, res: Response, next: NextFunction) => {
    getAccounts(req, res, next);
  }
);

export default apiRouter;
