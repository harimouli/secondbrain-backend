import dotenv from "dotenv";

dotenv.config();

export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret";
export const ACESS_TOKEN_SECRET =
  process.env.ACESS_TOKEN_SECRET || "default_access_secret";
export const SALT_ROUNDS: number = Number(process.env.SALT_ROUNDS!);
