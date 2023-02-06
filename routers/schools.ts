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
      res.status(404).json({ status: false, err: "School not found" });
    }
  }
);

// List Schools
schoolsRouter.get("/list", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { Schools } = await dbCon();
  const schools = await Schools.find({ enabled: true }).catch(catcher);
  if (schools) {
    res.status(200).json({
      status: true,
      data: schools,
    });
  } else {
    res.status(404).json({ status: false, err: "School not found" });
  }
});

// List Schools with schoolId
schoolsRouter.get("/:schoolId/info", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const schoolId = req.params.schoolId;
  const { Schools } = await dbCon();
  const schools = await Schools.find({
    _id: schoolId,
  }).catch(catcher);
  if (schools) {
    res.status(200).json({
      status: true,
      data: schools,
    });
  } else {
    res.status(404).json({ status: false, err: "School not found" });
  }
});  





export default schoolsRouter;
