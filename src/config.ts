import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET: string = process.env.JWT_SECRET!;
export const SALT_ROUNDS: number = Number(process.env.SALT_ROUNDS!);
