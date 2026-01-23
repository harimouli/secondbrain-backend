import rateLimit from "express-rate-limit";

import { Request, Response } from "express";
export const requestRateLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 15 minutes line up with common api rate limiting
  max: 100, // limited  each IP to 100 requests per windowMs

  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
