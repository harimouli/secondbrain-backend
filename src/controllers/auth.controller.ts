import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user.model";
import { RefreshTokenModel } from "../models/refreshToken.model";
import { ACESS_TOKEN_SECRET, SALT_ROUNDS } from "../config/config";
import { signupSchema } from "../validators";
import crypto from "crypto";
import { generateAcessToken } from "../services/accessToken.service";

export const signupController = async (req: Request, res: Response) => {
  try {
    const email: string = req.body.email;
    const username: string = req.body.username;
    const password: string = req.body.password;
    const confirmPassword: string = req.body.confirmPassword;

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "passwords do not match!",
      });

      return;
    }

    const parsedData = signupSchema.safeParse({
      email,
      username,
      password,
    });

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid signup data",
        errors: parsedData.error.message,
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Unable to create account",
      });

      return;
    }
    await UserModel.create({
      email: email,
      username: username,
      password: hashedPassword,
    });
    res.status(201).json({
      success: true,
      message: "you are signed up! please signin",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
    return;
  }
};

// sigin controller

export const signinController = async (req: Request, res: Response) => {
  try {
    const email: string = req.body.email;
    const password: string = req.body.password;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "email and password are required",
      });
      return;
    }

    const existingUser = await UserModel.findOne({
      email,
    });

    if (!existingUser) {
      res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password!,
    );
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid password or username",
      });
      return;
    }

    const accessToken: string = generateAcessToken(existingUser._id);
    // here i am generatinf refresh token
    const hashedToken = crypto.randomBytes(64).toString("hex");

    // using sha256 to hash the toekn for secuity
    const refreshToken: string = crypto
      .createHash("sha256")
      .update(hashedToken)
      .digest("hex");

    // inserting refresh token in db

    await RefreshTokenModel.create({
      token: refreshToken,
      userId: existingUser._id,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // refresh token expiry in 3 days
    });

    // sending access tokens and refresh tokens in http only cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: "none",
      secure: true,
      path: "/",
    });

    res.cookie("refreshToken", hashedToken, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000, // same as for token expiry , for 3 days here make sense of remmebering token expiry in mind
      path: "/",
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({
      success: true,
      userDetails: {
        username: existingUser.username,
        dateOfJoined: existingUser.dateOfJoined,
        isShareEnabled: existingUser.isShareEnabled,
        email: existingUser.email,
      },
      message: "You are logged in!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
  }
};
