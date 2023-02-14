// api routes
import { Router, Request, Response } from "express";
import { dbCon } from "../models";
const router = Router();

router.all("/", async (req: Request, res: Response) => {
  res.send({
    status: false,
    error: "Invalid API GET call",
  });
});

router.get("/:username/profile", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const username = req.params.username;
  const { Accounts } = await dbCon();
  const account = await Accounts.findOne({ username: username }).catch(catcher);
  if (account) {
    res.status(200).json({
      status: true,
      data: {
        _id: account._id,
        verified: account.verified,
        schoolId: account.schoolId,
        facultyId: account.facultyId,
        departmentId: account.departmentId,
        username: account.username,
        firstname: account.firstname,
        lastname: account.lastname,
        aboutMe: account.aboutMe,
        email: account.email,
        accountType: account.accountType,
        gender: account.gender,
        birthday: account.birthday,
        picture: account.picture,
        schoolCode: account.schoolCode,
        scopusId: account.scopusId,
        orcidId: account.orcidId,
        googleScholarId: account.googleScholarId,
        googlePresence: account.googlePresence,
        citations: account.citations,
        hindex: account.hindex,
        i10hindex: account.i10hindex,
        totalPublications: account.totalPublications,
        firstPublicationYear: account.firstPublicationYear,
        lastPublicationYear: account.lastPublicationYear,
        smsNotification: account.smsNotification,
        emailNotification: account.emailNotification,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      },
    });
    return;
  } else {
    res.status(400).json({ status: false, error: "Account not found" });
    return;
  }
});


export default router;
