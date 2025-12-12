import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../db";
import { z } from "zod";
import { JWT_SECRET, SALT_ROUNDS } from "../config";
import { signupSchema, SignupInput } from "../validators";

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
      username,
    });

    if (existingUser) {
      res.status(201).json({
        success: true,
        message: "user already exists! please signin",
      });

      return;
    }
    await UserModel.create({
      username: username,
      password: hashedPassword,
    });
    res.status(201).json({
      success: true,
      message: "you are signed man! please signin",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
    return;
  }
};

export const signinController = async (req: Request, res: Response) => {
  try {
    const username: string = req.body.username;
    const password: string = req.body.password;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: "username and password are required",
      });
      return;
    }

    const existingUser = await UserModel.findOne({
      username,
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
        message: "Invalid password! or username",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      success: true,
      token: token,
      userDetails: {
        username: existingUser.username,
        dateOfJoined: existingUser.dateOfJoined,
        isShareEnabled: existingUser.isShareEnabled,
      },

      message: "You are logged in!",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
  }
};
