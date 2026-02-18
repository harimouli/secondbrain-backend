import { Response } from "express";
import { AuthRequest } from "../middleware/middleware";
import { RefreshTokenModel } from "../models/refreshToken.model";

export const logoutController = (req: AuthRequest, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const logoutAllController = (req: AuthRequest, res: Response) => {
  // here we will revoke all the refresh tokens of the user and also clear the access token cookie
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  const userId = req.userId;
  // here we will revoke all the refresh tokens of the user by setting isRevoked to true
  RefreshTokenModel.updateMany(
    { userId },
    { $set: { isRevoked: true } },
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,

          message: "Something went wrong!",
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "Logged out from all devices successfully",
        });
      }
    },
  );
};
