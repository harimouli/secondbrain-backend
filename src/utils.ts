import base62 from "base62";
import crypto from "crypto";

export const generateUrlHash = (len: number): string => {
  const randomBytes = crypto.randomBytes(6).readUIntBE(0, 6);
  let hash = base62.encode(randomBytes % 62 ** len);

  return hash.padStart(len, "0");
};
