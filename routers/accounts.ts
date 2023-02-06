// api routes
import { dbCon } from "../models";
import { Router, Request, Response, NextFunction } from "express";
const accountsRouter = Router();
import bcrypt from "bcryptjs";

accountsRouter.get("/", (req: Request, res: Response) => {
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

export default accountsRouter;
