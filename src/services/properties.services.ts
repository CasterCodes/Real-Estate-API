import { query } from "express";
import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";

import Property, { PropertyDocument } from "../models/proterties.model";

export const createProperty = async (
  input: DocumentDefinition<PropertyDocument>
) => {
  return await Property.create(input);
};

export const findProperty = async (query: FilterQuery<PropertyDocument>) => {
  return await Property.findOne(query);
};

export const findAllProperties = async () => {
  return await Property.find({});
};

export const findPropertyAndDelete = async (
  query: FilterQuery<PropertyDocument>
) => {
  await Property.findByIdAndDelete(query);
};

export const findPropertyAndUpdate = async (
  query: FilterQuery<PropertyDocument>,
  update: UpdateQuery<PropertyDocument>,
  options: QueryOptions
) => {
  return await Property.findOneAndUpdate(query, update, options);
};

export const aggregate = async () => {
  return Property.aggregate([
    {
      $match: {},
    },
  ]);
};

export const findAndPopulate = async (
  query: FilterQuery<PropertyDocument>,
  value: string
) => {
  return await Property.find(query).populate(value);
};
