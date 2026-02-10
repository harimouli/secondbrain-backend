import { Response } from "express";
import { AuthRequest } from "../middleware/middleware";
import crypto from "crypto";
import { RefreshTokenModel } from "../models/refreshToken.model";
import { generateAcessToken } from "../services/accessToken.service";

export const accessTokenGenerator = async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken: string | undefined = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "unauthorized user",
      });
      return;
    }
    const hashedToken: string = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const existingToken = await RefreshTokenModel.findOne({
      hashedToken,
    });

    if (!existingToken) {
      res.status(401).json({
        success: false,
        message: "unauthorized user!",
      });
      return;
    }
    if (existingToken.isRevoked || existingToken.expiresAt < new Date()) {
      res.status(401).json({
        success: false,
        message: "unauthorized user!",
      });
      return;
    }
    const userId = existingToken.userId;
    req.userId = userId;

    const accessToken: string = generateAcessToken(userId);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000, // 15 minutes time for access token to expire
    });
    res.status(200).json({
      success: true,
      message: "Access token generated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};
