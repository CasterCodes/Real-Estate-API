import { LeanDocument, FilterQuery, UpdateQuery } from "mongoose";
import Session, { SessionDocument } from "../models/session.model";
import { findUserById } from "./users.services";
import { UserDocument } from "../models/user.model";
import { verifyToken, signToken } from "../utils/jwt.utils";
import { JWT_EXPIRES_IN, JWT_REFRESH_EXPIRESIN } from "../config/config";

export const createUserSession = async (userId: string, userAgent: string) => {
  const session = await Session.create({
    user: userId,
    valid: true,
    userAgent: userAgent,
  });

  return session;
};

export const createUserAccessToken = async (
  user:
    | Omit<UserDocument, "password">
    | LeanDocument<Omit<UserDocument, "password">>,
  session:
    | Omit<SessionDocument, "password">
    | LeanDocument<Omit<SessionDocument, "password">>
) => {
  const accessToken = await signToken(
    { ...user, session: session._id },
    { expiresIn: JWT_EXPIRES_IN }
  );

  return accessToken;
};

export const createUserRefreshToken = async (session: SessionDocument) => {
  const refreshToken = await signToken(
    { ...session },
    { expiresIn: JWT_REFRESH_EXPIRESIN }
  );
  return refreshToken;
};

export const updateUserSession = async (sessionId: SessionDocument["_id"]) => {
  return await Session.updateOne({ _id: sessionId }, { valid: false });
};

export const reIssueUserAccessToken = async (token: string) => {
  const { valid, expired, verified } = await verifyToken(token);

  if (!verified) return false;
  // @ts-ignore
  const session = await Session.findById(verified._doc._id);

  if (!session || !session?.valid) return false;

  const user = await findUserById(session.user);

  if (!user) return false;

  const newAccessToken = await signToken(
    { ...user, session: session._id },
    { expiresIn: JWT_EXPIRES_IN }
  );

  return newAccessToken;
};

export const findSessions = async (query: FilterQuery<SessionDocument>) => {
  return await Session.find(query);
};

export const findSession = async (query: FilterQuery<SessionDocument>) => {
  return await Session.findOne(query);
};
