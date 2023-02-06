// api routes
import { dbCon } from "../models";
import { Router, Request, Response, NextFunction } from "express";
const schoolsRouter = Router();

schoolsRouter.get("/", (req: Request, res: Response) => {
  res.send({
    status: false,
    error: "Invalid API GET call",
  });
});

schoolsRouter.get(
  "/domains/:domain/info",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const domain = req.params.domain;
    const { Schools } = await dbCon();
    const school = await Schools.findOne({ domain: domain }).catch(catcher);
    if (school) {
      res.status(200).json({
        status: true,
        data: school,
      });
    } else {
      res.status(404).json({ status: false, err: "Account not found" });
    }
  }
);

export default schoolsRouter;
