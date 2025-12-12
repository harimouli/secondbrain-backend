import rateLimit from "express-rate-limit";

import { Request, Response } from "express";
export const requestRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
