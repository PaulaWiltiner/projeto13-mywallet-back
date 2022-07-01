import Joi from "joi";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => {
  db = mongoClient.db(process.env.MONGO_DATABASE);
});

export async function signUpSchema(user) {
  const { email, password } = user;
  const findOne = await db.collection("users").findOne({ email });
  const userEmail = findOne ? findOne.email : "";
  return Joi.object({
    name: Joi.string().required(),
    password: Joi.string().required(),
    samePassword: Joi.string().valid(password).required(),
    email: Joi.string().email().invalid(userEmail).required(),
  }).validateAsync(user);
}

export async function signInSchema(user) {
  const { email, password } = user;
  const findOne = await db.collection("users").findOne({ email });
  const userPassword = bcrypt.compareSync(password, findOne.password)
    ? password
    : "";
  return Joi.object({
    password: Joi.string().required(),
    email: Joi.string().email().required(),
  }).validateAsync({ email, password: userPassword });
}

export async function recordSchema(record) {
  Joi.object({
    value: Joi.string()
      .pattern(/^[0-9]{1,6},[0-9]{2}$/)
      .required(),
    description: Joi.string().min(3).max(30).required(),
    type: Joi.string().valid("entry", "exit").required(),
  }).validateAsync(record);
}
