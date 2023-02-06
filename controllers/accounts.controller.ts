// api controllers

import { Request, Response } from "express";
import { dbCon } from "./../models";

const getAccounts = async (req: Request, res: Response) => {
  const { Accounts } = await dbCon();
  const accounts = await Accounts.find({});
  res.send({ account: accounts });
};

export { getAccounts };