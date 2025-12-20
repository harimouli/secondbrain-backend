import { Request, Response } from "express";
export const verifyauth = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "User is authenticated",
  });
};
