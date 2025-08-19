import dotenv from "dotenv"

dotenv.config();

export const JWT_PASSWORD: string = process.env.JWT_PASSWORD!;
export const SALT_ROUNDS: number = Number(process.env.saltRounds!);
