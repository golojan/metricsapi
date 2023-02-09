// api routes
import { dbCon } from "../models";
import { Router, Request, Response } from "express";
const accountsRouter = Router();
import bcrypt from "bcryptjs";

accountsRouter.all("/", (req: Request, res: Response) => {
  res.send({
    status: false,
    error: "Invalid API GET call",
  });
});

accountsRouter.post("/login", async (req: Request, res: Response) => {
  const catcher = (error: Error) => res.status(400).json({ error });
  const { username, password, domain } = req.body;
  const { Accounts, Schools } = await dbCon();
  // Get the School info with domain //
  const school: any = await Schools.findOne({
    domain: domain,
  }).catch(catcher);
  if (school) {
    // Get the School info with domain //
    await Accounts.findOne({
      email: username,
      schoolId: school._id,
    })
      .then((account: any) => {
        if (account._id) {
          const isPasswordValid = bcrypt.compareSync(
            password,
            account.password
          );
          if (isPasswordValid) {
            res.status(200).json({
              status: true,
              token: account._id,
              username: account.username,
              domain: domain,
              schoolId: account.schoolId,
            });
          } else {
            res.status(400).json({ status: false, domain: domain });
          }
        } else {
          res.status(400).json({ status: false, domain: domain });
        }
      })
      .catch(catcher);
  }
});

// List accounts
accountsRouter.get("/list", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { Accounts } = await dbCon();
  const account = await Accounts.find({}).catch(catcher);
  if (account) {
    res.status(200).json({
      status: true,
      data: account,
    });
  } else {
    res.status(404).json({ status: false, err: "Intakes not found" });
  }
});

// info
accountsRouter.post("/info", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { token } = req.body;
  const { Accounts } = await dbCon();
  await Accounts.findOne({ _id: token })
    .then((account) => {
      if (account) {
        res.status(200).json({
          status: true,
          accid: account._id,
          picture: account.picture,
          email: account.email,
          mobile: account.mobile,
          firstname: account.firstname,
          lastname: account.lastname,
          role: account.role,
          accountType: account.accountType,
          country: account.country,
          enabled: account.enabled,
        });
      } else {
        res.status(404).json({ status: 0, err: "Account not found" });
      }
    })
    .catch(catcher);
});

// Profile

accountsRouter.get("/:token/profile", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { token } = req.params;
  const { Accounts } = await dbCon();
  await Accounts.findOne({ _id: token })
    .then((account) => {
      if (account) {
        res.status(200).json({
          status: true,
          data: {
            _id: account._id,
            verified: account.verified,
            schoolId: account.schoolId,
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
      } else {
        res.status(400).json({ status: false, error: "Account not found" });
      }
    })
    .catch(catcher);
});

// username
accountsRouter.get("/:token/username", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { token } = req.params;
  console.log(token);
  const { Accounts } = await dbCon();
  const account = await Accounts.findOne({ _id: token }).catch(catcher);
  if (account) {
    res.status(200).json({
      status: true,
      username: account.username,
    });
    return;
  } else {
    res.status(400).json({ status: false, error: "Account not found" });
    return;
  }
});

export default accountsRouter;
