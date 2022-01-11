import jwt, { SignOptions } from "jsonwebtoken";

import { JWT_SECRET } from "../config/config";

export const verifyToken = async (token: string) => {
  try {
    // @ts-ignore
    const verified = await jwt.verify(token, JWT_SECRET);

    return { valid: true, expired: false, verified };
  } catch (error) {
    // @ts-ignore
    return {
      valid: false,
      // @ts-ignore
      expired: error.message === "jwt expired",
      verified: null,
    };
  }
};

export const signToken = async (object: Object, options?: SignOptions) => {
  // @ts-ignore
  return await jwt.sign(object, JWT_SECRET, options);
};
