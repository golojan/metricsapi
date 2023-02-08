import { AccountTypes, MembershipTypes } from "libs/interfaces";
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

    if (lecturers) {
      res.status(200).json({
        status: true,
        data: lecturers,
      });
    } else {
      return res
        .status(400)
        .json({ status: false, error: "No Statistics returned" });
    }
  }
);

// stats

lecturersRouter.get("/:schoolId/stats", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { schoolId } = req.params;
  const { Accounts } = await dbCon();
  if (!schoolId) {
    return res
      .status(400)
      .json({ status: false, err: "School ID is required" });
  }
  const lecturers: any = await Accounts.aggregate([
    {
      $match: {
        schoolId: schoolId,
        accountType: AccountTypes.LECTURER,
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

  if (lecturers[0]) {
    res.status(200).json({
      status: true,
      count: lecturers[0].totalStaff,
      citations: lecturers[0].citations,
      hindex: lecturers[0].hindex,
      i10hindex: lecturers[0].i10hindex,
      totalPublications: lecturers[0].totalPublications,
      firstPublicationYear: lecturers[0].firstPublicationYear,
      lastPublicationYear: lecturers[0].lastPublicationYear,
      totalStaff: lecturers[0].totalStaff,
      totalStaffWithGooglePresence: lecturers[0].totalStaffWithGooglePresence,
      totalStaffWithOutGooglePresence:
        lecturers[0].totalStaffWithOutGooglePresence,
      internationalStaff: lecturers[0].internationalStaff,
      localStaff: lecturers[0].localStaff,
      highestCitations: lecturers[0].highestCitations,
      highestHindex: lecturers[0].highestHindex,
      highestI10hindex: lecturers[0].highestI10hindex,
      highestTotalPublications: lecturers[0].highestTotalPublications,
      lowestCitations: lecturers[0].lowestCitations,
      lowestHindex: lecturers[0].lowestHindex,
      lowestI10hindex: lecturers[0].lowestI10hindex,
      lowestTotalPublications: lecturers[0].lowestTotalPublications,
      fullProfessors: lecturers[0].fullProfessors,
    });
  } else {
    res.status(400).json({ status: false, error: "No Statistics returned" });
  }
});

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
