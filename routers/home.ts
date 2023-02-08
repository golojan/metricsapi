// api routes
import { Router, Request, Response } from "express";
const router = Router();

router.all("/", async (req: Request, res: Response) => {
  res.send({
    status: false,
    error: "Invalid API GET call",
  });
});

export default router;
