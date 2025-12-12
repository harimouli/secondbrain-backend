import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes..lol protection from bad guys trying to brute force login.. lol
  max: 8, // limit each IP to 8 requests per windowMs....lol brute force protection
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts, please try again later.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
