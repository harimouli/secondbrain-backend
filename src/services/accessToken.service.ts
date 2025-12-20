import mongoose from "mongoose";
import { ACESS_TOKEN_SECRET } from "../config/config";

import jwt from "jsonwebtoken";
// generating access token here..
export const generateAcessToken = (userId: mongoose.Types.ObjectId): string => {
  const accessToken: string = jwt.sign({ userId: userId }, ACESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  return accessToken;
};
