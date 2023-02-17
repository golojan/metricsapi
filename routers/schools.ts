// api routes
import { AccountTypes, Gender, MembershipTypes } from "../libs/interfaces";
import { dbCon } from "../models";
import { Router, Request, Response } from "express";

const schoolsRouter = Router();

schoolsRouter.all("/", (req: Request, res: Response) => {
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

//  Schools Info POST
schoolsRouter.get("/info", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const domain = req.body.domain;
  const { Schools } = await dbCon();
  const school = await Schools.findOne({ domain: domain }).catch(catcher);
  if (school) {
    res.status(200).json({
      status: true,
      domain: domain,
      schoolId: school._id,
      data: school,
    });
  } else {
    res.status(400).json({ status: false });
  }
});

// List Schools with schoolId
schoolsRouter.get("/:schoolId/info", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const schoolId = req.params.schoolId;
  const { Schools } = await dbCon();
  const schools = await Schools.findOne({
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

// Stats
schoolsRouter.get("/:schoolId/stats", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const schoolId = req.params.schoolId;
  const { Accounts } = await dbCon();

  const gs_results: any = await Accounts.aggregate([
    { $match: { schoolId: String(schoolId) } },
    {
      $group: {
        _id: "$schoolId",
        totalCitations: { $sum: "$citations" },
        totalPublications: { $sum: "$totalPublications" },
        totalHIndex: { $sum: "$hindex" },
        totalI10Index: { $sum: "$i10hindex" },
        totalAccounts: { $sum: 1 },
        totalStudents: {
          $sum: {
            $cond: [{ $eq: ["$accountType", AccountTypes.STUDENT] }, 1, 0],
          },
        },
        totalFemaleStudents: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$accountType", AccountTypes.STUDENT] },
                  { $eq: ["$gender", Gender.FEMALE] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalLecturers: {
          $sum: {
            $cond: [{ $eq: ["$accountType", AccountTypes.LECTURER] }, 1, 0],
          },
        },
        totalFemaleLecturers: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$accountType", AccountTypes.LECTURER] },
                  { $eq: ["$gender", Gender.FEMALE] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalAlumni: {
          $sum: {
            $cond: [{ $eq: ["$accountType", AccountTypes.ALUMNI] }, 1, 0],
          },
        },
        totalInternalStaff: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$accountType", AccountTypes.LECTURER] },
                  { $eq: ["$membershipType", MembershipTypes.INTERNATIONAL] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalInternationalStudents: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$accountType", AccountTypes.STUDENT] },
                  { $eq: ["$membershipType", MembershipTypes.INTERNATIONAL] },
                ],
              },
              1,
              0,
            ],
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
        totalPHDs: {
          $sum: {
            $cond: [
              {
                $eq: ["$isPHD", true],
              },
              1,
              0,
            ],
          },
        },
        totalReaders: {
          $sum: {
            $cond: [
              {
                $eq: ["$isReader", true],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: "$_id",
        totalCitations: 1,
        totalPublications: 1,
        totalHIndex: 1,
        totalI10Index: 1,
        totalAccounts: 1,
        totalStudents: 1,
        totalLecturers: 1,
        totalAlumni: 1,
        totalInternalStaff: 1,
        totalInternationalStudents: 1,
        fullProfessors: 1,
        totalPHDs: 1,
        totalReaders: 1,
        lecturerStudentRatio: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$totalLecturers", 0] },
                { $eq: ["$totalStudents", 0] },
              ],
            },
            then: 0,
            else: {
              $multiply: [
                { $divide: ["$totalLecturers", "$totalStudents"] },
                100,
              ],
            },
          },
        },
        firstPublicationYear: {
          $ifNull: [
            {
              $min: {
                $filter: {
                  input: "$firstPublicationYear",
                  cond: { $gt: ["$$this", 0] },
                },
              },
            },
            {
              $subtract: [{ $year: new Date() }, 4],
            },
          ],
        },
        citationsPerCapita: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$totalCitations", 0] },
                { $eq: ["$totalPublications", 0] },
              ],
            },
            then: 0,
            else: {
              $divide: ["$totalCitations", "$totalPublications"],
            },
          },
        },
        hindexPerCapita: {
          $divide: [
            "$totalPublications",
            {
              $ifNull: [
                {
                  $min: {
                    $filter: {
                      input: "$firstPublicationYear",
                      cond: { $gt: ["$$this", 0] },
                    },
                  },
                },
                {
                  $subtract: [{ $year: new Date() }, 4],
                },
              ],
            },
          ],
        },
        i10hindexPerCapita: {
          $divide: [
            "$totalPublications",
            {
              $ifNull: [
                {
                  $min: {
                    $filter: {
                      input: "$firstPublicationYear",
                      cond: { $gt: ["$$this", 0] },
                    },
                  },
                },
                {
                  $subtract: [{ $year: new Date() }, 4],
                },
              ],
            },
          ],
        },
        totalStaffWithOutGooglePresence: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$totalCitations", 0] },
                { $eq: ["$totalHIndex", 0] },
                { $eq: ["$totalI10Index", 0] },
              ],
            },
            then: 1,
            else: 0,
          },
        },
        totalStaffWithGooglePresence: {
          $sum: {
            $cond: {
              if: {
                $or: [
                  { $gt: ["$totalCitations", 0] },
                  { $gt: ["$totalHIndex", 0] },
                  { $gt: ["$totalI10Index", 0] },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
        totalFemaleStudents: 1,
        totalFemaleLecturers: 1,
        percentageFemaleStudents: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$totalStudents", 0] },
                { $eq: ["$totalFemaleStudents", 0] },
              ],
            },
            then: 0,
            else: {
              $multiply: [
                { $divide: ["$totalFemaleStudents", "$totalStudents"] },
                100,
              ],
            },
          },
        },
        percentageFemaleLecturers: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$totalLecturers", 0] },
                { $eq: ["$totalFemaleLecturers", 0] },
              ],
            },
            then: 0,
            else: {
              $multiply: [
                { $divide: ["$totalFemaleLecturers", "$totalLecturers"] },
                100,
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        schoolId: "$_id",
        totalCitations: 1,
        totalPublications: 1,
        totalHIndex: 1,
        totalI10Index: 1,
        totalAccounts: 1,
        totalStudents: 1,
        totalLecturers: 1,
        totalAlumni: 1,
        totalInternalStaff: 1,
        totalInternationalStudents: 1,
        lecturerStudentRatio: 1,
        firstPublicationYear: 1,
        citationsPerCapita: 1,
        hindexPerCapita: 1,
        i10hindexPerCapita: 1,
        totalFemaleStudents: 1,
        totalFemaleLecturers: 1,
        fullProfessors: 1,
        totalPHDs: 1,
        totalReaders: 1,
        percentageOfStaffWithGooglePresence: {
          $cond: {
            if: {
              $eq: ["$totalStaffWithGooglePresence", 0],
            },
            then: 0,
            else: {
              $multiply: [
                {
                  $divide: ["$totalStaffWithGooglePresence", "$totalLecturers"],
                },
                100,
              ],
            },
          },
        },
        percentageOfInternationalStaff: {
          $cond: {
            if: {
              $eq: ["$totalInternalStaff", 0],
            },
            then: 0,
            else: {
              $multiply: [
                { $divide: ["$totalInternalStaff", "$totalLecturers"] },
                100,
              ],
            },
          },
        },
        percentageOfInternationalStudents: {
          $cond: {
            if: {
              $eq: ["$totalInternationalStudents", 0],
            },
            then: 0,
            else: {
              $multiply: [
                { $divide: ["$totalInternationalStudents", "$totalStudents"] },
                100,
              ],
            },
          },
        },
        percentageFullProfessors: {
          $cond: {
            if: {
              $eq: ["$fullProfessors", 0],
            },
            then: 0,
            else: {
              $multiply: [
                { $divide: ["$fullProfessors", "$totalLecturers"] },
                100,
              ],
            },
          },
        },
        percentagePHDs: {
          $cond: {
            if: {
              $eq: ["$totalPHDs", 0],
            },
            then: 0,
            else: {
              $multiply: [{ $divide: ["$totalPHDs", "$totalLecturers"] }, 100],
            },
          },
        },
        percentageReaders: {
          $cond: {
            if: {
              $eq: ["$totalReaders", 0],
            },
            then: 0,
            else: {
              $multiply: [
                { $divide: ["$totalReaders", "$totalLecturers"] },
                100,
              ],
            },
          },
        },
        percentageFemaleStudents: 1,
        percentageFemaleLecturers: 1,
        percentageProffessorsAndReaders: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$fullProfessors", 0] },
                { $eq: ["$totalReaders", 0] },
                { $eq: ["$totalLecturers", 0] },
              ],
            },
            then: 0,
            else: {
              $multiply: [
                {
                  $divide: [
                    { $add: ["$fullProfessors", "$totalReaders"] },
                    "$totalLecturers",
                  ],
                },
                100,
              ],
            },
          },
        },
        total: {
          $avg: [
            "$citationsPerCapita",
            "$hindexPerCapita",
            "$i10hindexPerCapita",
          ],
        },
      },
    },
  ]).catch(catcher);

  if (gs_results[0]) {
    res.status(200).json({
      status: true,
      ...gs_results[0],
    });
  } else {
    res.status(400).json({ status: false, error: "No Statistics returned" });
  }
});

schoolsRouter.get(
  "/:schoolId/accounts",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const schoolId = req.params.schoolId;
    const { Accounts } = await dbCon();
    const accounts = await Accounts.find({ schoolId: schoolId }).catch(catcher);
    if (accounts) {
      res.status(200).json({
        status: true,
        data: accounts,
      });
    } else {
      res.status(404).json({ status: false, err: "Account not found" });
    }
  }
);

schoolsRouter.post(
  "/:schoolId/dump-mrcs",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const schoolId = req.params.schoolId;
    const { mrcsData } = req.body;
    const { MRCs } = await dbCon();
    const saved = await MRCs.insertMany(mrcsData).catch(catcher);
    if (saved) {
      res.status(200).json({
        status: true,
        ...saved,
      });
    } else {
      res.status(404).json({ status: false, err: "Account not found" });
    }
  }
);

schoolsRouter.get("/:schoolId/history", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const schoolId = req.params.schoolId;
  const { Schools } = await dbCon();
  const school = await Schools.findOne({ _id: schoolId }).catch(catcher);
  if (school) {
    res.status(200).json({
      status: true,
      data: school.history,
    });
  } else {
    res.status(404).json({ status: false, err: "Account not found" });
  }
});

schoolsRouter.get("/:schoolId/mrcs", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const schoolId = req.params.schoolId;
  const { MRCs } = await dbCon();
  const mrcs = await MRCs.find({ schoolId: schoolId }).catch(catcher);
  if (mrcs) {
    res.status(200).json({
      status: true,
      data: mrcs,
    });
  } else {
    res.status(404).json({ status: false, err: "MRCS Accounts not found" });
  }
});

schoolsRouter.post(
  "/:schoolId/save-settings",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const schoolId = req.params.schoolId;
    const {
      citationsWeight,
      hindexWeight,
      i10hindexWeight,
      googlePresenceWeight,
      internationalStaffWeight,
      internationalStudentsWeight,
      internationalCollaborationWeight,
      graduationOutputWeight,
      fullProfessorsWeight,
      phdStudentsWeight,
      accreditationWeight,
      teacherStudentRatioWeight,
      femaleStaffWeight,
      femaleStudentsWeight,
      profsReadersWeight,
      seniorLecturersWeight,
      otherLecturersWeight,
    } = req.body;

    const newSettings = {
      citationsWeight: citationsWeight,
      hindexWeight: hindexWeight,
      i10hindexWeight: i10hindexWeight,
      googlePresenceWeight: googlePresenceWeight,
      internationalStaffWeight: internationalStaffWeight,
      internationalStudentsWeight: internationalStudentsWeight,
      internationalCollaborationWeight: internationalCollaborationWeight,
      graduationOutputWeight: graduationOutputWeight,
      fullProfessorsWeight: fullProfessorsWeight,
      phdStudentsWeight: phdStudentsWeight,
      accreditationWeight: accreditationWeight,
      teacherStudentRatioWeight: teacherStudentRatioWeight,
      femaleStaffWeight: femaleStaffWeight,
      femaleStudentsWeight: femaleStudentsWeight,
      profsReadersWeight: profsReadersWeight,
      seniorLecturersWeight: seniorLecturersWeight,
      otherLecturersWeight: otherLecturersWeight,
    };

    const { Schools } = await dbCon();
    const saved = await Schools.findOneAndUpdate(
      { _id: schoolId },
      {
        settings: newSettings,
      }
    ).catch(catcher);

    console.log({ saved });

    if (saved) {
      res.status(200).json({
        status: true,
        ...saved,
      });
    } else {
      res.status(404).json({ status: false, err: "Account not found" });
    }
  }
);

schoolsRouter.post("/:schoolId/save", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const schoolId = req.params.schoolId;
  const { lecturers, students, school, name, allschools } = req.body;
  const { Schools } = await dbCon();
  const saved = await Schools.findOneAndUpdate(
    { _id: schoolId },
    {
      $push: {
        history: {
          name: name,
          lecturers: lecturers,
          students: students,
          googlePresence: school.googlePresence,
          citations: school.citations,
          hindex: school.hindex,
          i10hindex: school.i10hindex,
          allschools: allschools,
        },
      },
    }
  ).catch(catcher);
  if (saved) {
    res.status(200).json({
      status: true,
      data: saved,
    });
  } else {
    res.status(404).json({ status: false, err: "Account not found" });
  }
});

schoolsRouter.get(
  "/:schoolId/settings",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const schoolId = req.params.schoolId;
    const { Schools } = await dbCon();
    const school = await Schools.findOne({ _id: schoolId }).catch(catcher);
    if (school) {
      const settings = school.settings;
      res.status(200).json({
        status: true,
        ...settings,
      });
    } else {
      res.status(404).json({ status: false, err: "Schools not found" });
    }
  }
);

export default schoolsRouter;
