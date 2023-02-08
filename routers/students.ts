import { AccountTypes, MembershipTypes } from "libs/interfaces";
import { dbCon } from "../models";
import { Router, Request, Response } from "express";
const studentsRouter = Router();

studentsRouter.all("/", (req: Request, res: Response) => {
  res.send({
    status: false,
    error: "Invalid API GET call",
  });
});

// count //
studentsRouter.get("/:schoolId/count", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const schoolId = req.params.schoolId;
  const { Lecturers } = await dbCon();
  const total = await Lecturers.countDocuments({
    schoolId: schoolId,
    accoutnType: AccountTypes.STUDENT,
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

// List Students
studentsRouter.get("/:schoolId/list", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const schoolId = req.params.schoolId;
  const { Accounts } = await dbCon();
  const students = await Accounts.find({
    schoolId: schoolId,
    accountType: AccountTypes.STUDENT,
  }).catch(catcher);
  if (students) {
    res.status(200).json({
      status: true,
      data: students,
    });
  } else {
    res.status(404).json({ status: false, err: "Account not found" });
  }
});

// Ranking
studentsRouter.get(
  "/:schoolId/ranking",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const schoolId = req.params.schoolId;
    const { Accounts } = await dbCon();
    const students: any = await Accounts.aggregate([
      {
        $match: {
          schoolId: schoolId,
          accountType: AccountTypes.STUDENT,
        },
      },
      {
        $project: {
          schoolId: 1,
          picture: 1,
          username: 1,
          email: 1,
          mobile: 1,
          firstname: 1,
          lastname: 1,
          googlePresence: 1,
          membershipType: 1,
          isPHD: 1,
          isPGD: 1,
          isReader: 1,
          isFellow: 1,
          isFullProfessor: 1,
          firstPublicationYear: 1,
          lastPublicationYear: 1,
          totalPublications: 1,
          searchMetadata: 1,
          fullname: {
            $concat: ["$firstname", " ", "$lastname"],
          },
          citations: 1,
          hindex: 1,
          i10hindex: 1,
          citationsPerCapita: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$citations", 0] },
                  { $eq: ["$totalPublications", 0] },
                ],
              },
              then: 0,
              else: {
                $divide: ["$citations", "$totalPublications"],
              },
            },
          },
          hindexPerCapita: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$hindex", 0] },
                  { $eq: ["$firstPublicationYear", 0] },
                ],
              },
              then: 0,
              else: {
                $divide: [
                  "$hindex",
                  {
                    $subtract: [{ $year: new Date() }, "$firstPublicationYear"],
                  },
                ],
              },
            },
          },
          i10hindexPerCapita: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$i10hindex", 0] },
                  { $eq: ["$firstPublicationYear", 0] },
                ],
              },
              then: 0,
              else: {
                $divide: [
                  "$i10hindex",
                  {
                    $subtract: [{ $year: new Date() }, "$firstPublicationYear"],
                  },
                ],
              },
            },
          },
        },
      },
    ]).catch(catcher);

    if (students) {
      res.status(200).json({
        status: true,
        data: students,
      });
    } else {
      return res
        .status(400)
        .json({ status: false, error: "No Statistics returned" });
    }
  }
);

// stats
studentsRouter.get("/:schoolId/stats", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { schoolId } = req.params;
  const { Accounts } = await dbCon();
  if (!schoolId) {
    return res
      .status(400)
      .json({ status: false, err: "School ID is required" });
  }
  const students: any = await Accounts.aggregate([
    {
      $match: {
        schoolId: schoolId,
        accountType: AccountTypes.STUDENT,
      },
    },
    {
      $group: {
        citations: { $sum: "$citations" },
        hindex: { $sum: "$hindex" },
        i10hindex: { $sum: "$i10hindex" },
        totalPublications: { $sum: "$totalPublications" },
        firstPublicationYear: { $min: "$firstPublicationYear" },
        lastPublicationYear: { $max: "$lastPublicationYear" },
        highestCitations: { $max: "$citations" },
        highestHindex: { $max: "$hindex" },
        highestI10hindex: { $max: "$i10hindex" },
        highestTotalPublications: { $max: "$totalPublications" },
        lowestCitations: { $min: "$citations" },
        lowestHindex: { $min: "$hindex" },
        lowestI10hindex: { $min: "$i10hindex" },
        lowestTotalPublications: { $min: "$totalPublications" },
        totalStaff: { $sum: 1 },
        totalStaffWithGooglePresence: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $gt: ["$citations", 0] },
                  { $gt: ["$hindex", 0] },
                  { $gt: ["$i10hindex", 0] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalStaffWithOutGooglePresence: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$citations", 0] },
                  { $eq: ["$hindex", 0] },
                  { $eq: ["$i10hindex", 0] },
                ],
              },
              1,
              0,
            ],
          },
        },
        internationalStaff: {
          $sum: {
            $cond: [
              { $eq: ["$membershipType", MembershipTypes.INTERNATIONAL] },
              1,
              0,
            ],
          },
        },
        localStaff: {
          $sum: {
            $cond: [{ $eq: ["$membershipType", MembershipTypes.LOCAL] }, 1, 0],
          },
        },
        fullProfessors: {
          $sum: {
            $cond: [
              {
                $eq: ["$isFullProfessor", true],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]).catch(catcher);

  if (students[0]) {
    res.status(200).json({
      status: true,
      count: students[0].totalStaff,
      citations: students[0].citations,
      hindex: students[0].hindex,
      i10hindex: students[0].i10hindex,
      totalPublications: students[0].totalPublications,
      firstPublicationYear: students[0].firstPublicationYear,
      lastPublicationYear: students[0].lastPublicationYear,
      totalStaff: students[0].totalStaff,
      totalStaffWithGooglePresence: students[0].totalStaffWithGooglePresence,
      totalStaffWithOutGooglePresence:
        students[0].totalStaffWithOutGooglePresence,
      internationalStaff: students[0].internationalStaff,
      localStaff: students[0].localStaff,
      highestCitations: students[0].highestCitations,
      highestHindex: students[0].highestHindex,
      highestI10hindex: students[0].highestI10hindex,
      highestTotalPublications: students[0].highestTotalPublications,
      lowestCitations: students[0].lowestCitations,
      lowestHindex: students[0].lowestHindex,
      lowestI10hindex: students[0].lowestI10hindex,
      lowestTotalPublications: students[0].lowestTotalPublications,
      fullProfessors: students[0].fullProfessors,
    });
  } else {
    res.status(400).json({ status: false, error: "No Statistics returned" });
  }
});

studentsRouter.get("/info/:username", async (req: Request, res: Response) => {
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

studentsRouter.get("/update/:id/ajax", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { id } = req.params;
  const { membershipType, isPHD, isPGD } = req.body;
  const { Accounts } = await dbCon();
  console.log(req.body);
  const updated = await Accounts.updateOne(
    { _id: id },
    {
      membershipType: membershipType,
      isPHD: isPHD,
      isPGD: isPGD,
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
