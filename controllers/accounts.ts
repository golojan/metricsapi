// api controllers

import { Request, Response, NextFunction } from "express";
import { dbCon } from "../models";

const getAccounts = async (req: Request, res: Response, next: NextFunction) => {
  const { Accounts } = await dbCon();
  const accounts = await Accounts.find({});
  res.send({ account: accounts });
  next();
};

export { getAccounts };
