import { AccountTypes } from "../libs/interfaces";
import { dbCon } from "../models";
import { Router, Request, Response } from "express";
const lecturersRouter = Router();

lecturersRouter.all("/", (req: Request, res: Response) => {
  res.send({
    status: false,
    error: "Invalid API GET call",
  });
});

// count //
lecturersRouter.get("/:schoolId/count", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const schoolId = req.params.schoolId;
  const { Lecturers } = await dbCon();
  const total = await Lecturers.countDocuments({
    schoolId: schoolId,
    accountType: AccountTypes.LECTURER,
  }).catch(catcher);
  if (total) {
    res.status(200).json({
      status: true,
      total: total,
    });
  } else {
    res.status(404).json({ status: false, err: "Lecturers not found" });
  }
});

// List Lecturers
lecturersRouter.get("/:schoolId/list", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const schoolId = req.params.schoolId;
  const { Accounts } = await dbCon();
  const lecturers = await Accounts.find({
    schoolId: schoolId,
    accountType: AccountTypes.LECTURER,
  }).catch(catcher);
  if (lecturers) {
    res.status(200).json({
      status: true,
      data: lecturers,
    });
  } else {
    res.status(404).json({ status: false, err: "Account not found" });
  }
});

// Ranking

lecturersRouter.get(
  "/:schoolId/ranking",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const schoolId = req.params.schoolId;
    const { Accounts } = await dbCon();

    const lecturers = await Accounts.aggregate([
      {
        $match: {
          schoolId: schoolId,
          accountType: AccountTypes.LECTURER,
        },
      },
    ]).catch(catcher);

    if (lecturers) {
      res.status(200).json({
        status: true,
        data: lecturers,
      });
    } else {
      res.status(400).json({ status: false, error: "No Statistics returned" });
    }
  }
);



lecturersRouter.get("/info/:username", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { username } = req.params;
  const { Lecturers } = await dbCon();
  const lecturer = await Lecturers.findOne({ username: username }).catch(
    catcher
  );
  if (lecturer) {
    res.status(200).json({
      status: true,
      data: lecturer,
    });
  } else {
    res.status(400).json({ status: false, error: "No Lecturer Found" });
  }
});

lecturersRouter.get("/update/:id/ajax", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { id } = req.params;
  const { membershipType, isPHD, isReader, isFellow, isFullProfessor } =
    req.body;
  const { Accounts } = await dbCon();
  console.log(req.body);
  const updated = await Accounts.updateOne(
    { _id: id },
    {
      membershipType: membershipType,
      isPHD: isPHD,
      isReader: isReader,
      isFellow: isFellow,
      isFullProfessor: isFullProfessor,
    }
  ).catch(catcher);
  if (updated) {
    res.status(200).json({
      status: true,
      ...updated,
    });
  } else {
    res.status(400).json({ status: false, error: "No Profile updated" });
  }
});

export default lecturersRouter;
