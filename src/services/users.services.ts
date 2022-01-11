import { query } from "express";
import { DocumentDefinition, FilterQuery, UpdateQuery } from "mongoose";
import User, { UserDocument } from "../models/user.model";

export const createUser = async (input: DocumentDefinition<UserDocument>) => {
  return await User.create(input);
};

export const validateUserPassword = async (
  email: UserDocument["email"],
  password: UserDocument["password"]
) => {
  const user = await User.findOne({ email });

  const isPasswordValid = await user?.comparePassword(password);

  if (!isPasswordValid || !user) return false;

  return user;
};

export const findUserById = async (id: FilterQuery<UserDocument["_id"]>) => {
  return await User.findById(id);
};

export const findUser = async (query: FilterQuery<UserDocument>) => {
  return await User.findOne(query);
};

export const findUserAgents = async (query: FilterQuery<UserDocument>) => {
  return await User.find({ role: "agent" });
};

export const findUsers = async (query: FilterQuery<UserDocument>) => {
  return await User.find();
};

export const updateUser = async (
  query: FilterQuery<UserDocument>,
  update: UpdateQuery<UserDocument>
) => {
  return await User.findOneAndUpdate(query, update);
};

export const deleteUser = async (id: UserDocument["_id"]) => {
  return await User.findByIdAndDelete(id);
};
