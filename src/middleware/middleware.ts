import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { UserModel } from "../models/user.model";
import { RefreshTokenModel } from "../models/refreshToken.model";
import { ACESS_TOKEN_SECRET } from "../config/config";
import crypto from "crypto";
import { generateAcessToken } from "../services/accessToken.service";
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
      throw new jwt.TokenExpiredError("No access token", new Date());
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
    // now we have to handle the access token expiry case here based on refresh token
    // here we are checking whether the error is due to token expiry or some other issue

    if (!(error instanceof jwt.TokenExpiredError)) {
      res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
      return;
    }

    // refresh token flow starts here
    const refreshToken: string = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
      return;
    }

    // hashing the refreshToken to verify it with Db - refresh token
    const hashedTokenCookie: string = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    try {
      // hittign the db to find the userId
      const existingToken = await RefreshTokenModel.findOne({
        token: hashedTokenCookie,
      });
      if (!existingToken) {
        res.status(401).json({
          success: false,
          message: "Unauthorized user",
        });
        return;
      }
      if (existingToken.expiresAt < new Date() || existingToken.isRevoked) {
        res.status(401).json({
          success: false,
          message: "Refresh token expired, please signin again",
        });
        return;
      }

      req.userId = existingToken.userId;
      const newAccessToken: string = generateAcessToken(req.userId);
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000, // 15 minutes bro
        sameSite: "none",
        secure: true,
      });
      next(); // all good go to next middleware/controller
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Something went wrong!",
      });
    }
  }
};
