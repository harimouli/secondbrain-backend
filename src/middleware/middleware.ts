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
    // verifying the access token

    const accessToken: string | undefined = req.cookies.accessToken;
    if (!accessToken) {
      res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
      return;
    }
    // revering the access token payload here
    const decoded = jwt.verify(accessToken as string, ACESS_TOKEN_SECRET);

    // here just extracting userId and converting to mongoose objectId
    const userId = new mongoose.Types.ObjectId(
      (decoded as { userId: string }).userId,
    );

    // it is secuirty check whether userId is valid or not
    const isValidUser = await UserModel.findById(userId);

    if (!isValidUser) {
      res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
      return;
    }
    req.userId = userId; // setting userId in req object for further for controllers
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "something went wrong!",
    });
    return;
  }
};
