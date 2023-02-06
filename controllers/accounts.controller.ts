// api controllers

import { Request, Response, NextFunction } from "express";
import { dbCon } from "./../models";

export const getAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { Accounts } = await dbCon();
  const accounts = await Accounts.find({});
  res.json({ account: accounts });
};
