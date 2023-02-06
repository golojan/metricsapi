// api routes
import { Router, Request, Response, NextFunction } from "express";
import { getAccounts } from "../controllers/accounts.controller";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
  res.json({
    status: false,
    error: "Invalid API GET call",
  });
});
router.post("/", (req: Request, res: Response) => {
  res.json({
    status: false,
    error: "Invalid API POST call",
  });
});

export default router;
