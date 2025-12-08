import base62 from "base62";
import crypto from "crypto";

export const generateUrlHash = (len: number): string => {
  if (!Number.isInteger(len) || len < 1 || len > 10) {
    throw new Error("Hash length must be an integer between 1 and 10");
  }

  const randomValue = crypto.randomBytes(6).readUIntBE(0, 6);
  let hash = base62.encode(randomValue % 62 ** len);

  return hash.padStart(len, "0");
};
