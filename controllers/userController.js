import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { signInSchema, signUpSchema } from "./validationsController.js";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => {
  db = mongoClient.db(process.env.MONGO_DATABASE);
});

export async function signUp(req, res) {
  try {
    const { name, email, password } = req.body;
    await signUpSchema(req.body);
    const passwordHash = bcrypt.hashSync(password, 10);
    const { insertedId: userId } = await db
      .collection("users")
      .insertOne({ name, email, password: passwordHash });
    await db.collection("records").insertOne({
      userId: userId,
      records: [],
    });
    return res.sendStatus(201);
  } catch (err) {
    const errList = err.details;
    if (errList) {
      if (errList[0].type === "any.invalid") {
        return res.sendStatus(409);
      }
    }
    return res.sendStatus(422);
  }
}

export async function signIn(req, res) {
  try {
    const { email } = req.body;
    await signInSchema(req.body);
    const token = uuidv4();
    const user = await db.collection("users").findOne({ email });
    await db.collection("sessions").insertOne({
      userId: user._id,
      token,
    });
    return res.status(200).send({
      name: user.name,
      token,
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(422);
  }
}
