import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { UserModel } from "../models/user.model";

import { ACESS_TOKEN_SECRET } from "../config/config";

export interface AuthRequest extends Request {
  userId?: mongoose.Types.ObjectId;
}

export const userMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const header = req.headers["authorization"];
    const authToken = header && header.split(" ")[1];

    if (!authToken) {
      res.status(401).json({
        message: "You are not logged in!",
      });
      return;
    }
    const decoded: { userId: string } = jwt.verify(
      authToken as string,
      ACESS_TOKEN_SECRET!,
    ) as { userId: string }; // this either gets decoded or it will throw error.. /lol

    const id: string = decoded.userId;
    const userId = new mongoose.Types.ObjectId(decoded.userId);
    req.userId = userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "user not found!", // user not found
      });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token!",
    });
    return;
  }
};
