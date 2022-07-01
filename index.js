import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dayjs from "dayjs";
import Joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { MongoClient } from "mongodb";
import ObjectId from "bson-objectid";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
  db = mongoClient.db("databaseMyWallet");
});

const signUpSchema = async (user) => {
  const { email, password } = user;
  const findOne = await db.collection("users").findOne({ email });
  const userEmail = findOne ? findOne.email : "";
  return Joi.object({
    name: Joi.string().required(),
    password: Joi.string().required(),
    samePassword: Joi.string().valid(password).required(),
    email: Joi.string().email().invalid(userEmail).required(),
  }).validateAsync(user);
};

const signInSchema = async (user) => {
  const { email, password } = user;
  const findOne = await db.collection("users").findOne({ email });
  const userPassword = bcrypt.compareSync(password, findOne.password)
    ? password
    : "";
  return Joi.object({
    password: Joi.string().required(),
    email: Joi.string().email().required(),
  }).validateAsync({ email, password: userPassword });
};

const recordSchema = async (record) =>
  Joi.object({
    value: Joi.string()
      .pattern(/^[0-9]{1,6},[0-9]{2}$/)
      .required(),
    description: Joi.string().min(3).max(30).required(),
    type: Joi.string().valid("entry", "exit").required(),
  }).validateAsync(record);

const server = express();
server.use(express.json());
server.use(cors());

server.post("/sign-up", async (req, res) => {
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
});

server.post("/sign-in", async (req, res) => {
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
    return res.sendStatus(422);
  }
});

server.get("/records", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const tokenAuth = authorization?.replace("Bearer ", "");
    const session = await db
      .collection("sessions")
      .findOne({ token: tokenAuth });
    if (!session || !tokenAuth) {
      return res.sendStatus(401);
    }
    const userList = await db
      .collection("records")
      .findOne({ userId: session.userId });
    const listRecords = userList.records;
    const listReverse = listRecords.reverse();
    return res.send(listReverse);
  } catch (err) {
    return res.sendStatus(500);
  }
});

server.post("/records", async (req, res) => {
  try {
    const { value, description } = req.body;
    const typeRecord = req.query.typeRecord;
    await recordSchema({ ...req.body, type: typeRecord });
    const { authorization } = req.headers;
    const tokenAuth = authorization?.replace("Bearer ", "");
    const session = await db
      .collection("sessions")
      .findOne({ token: tokenAuth });
    if (!session || !tokenAuth) {
      return res.sendStatus(401);
    }
    const record = {
      userId: session.userId,
      type: typeRecord,
      value: value,
      description: description,
      date: dayjs().format("DD/MM"),
    };

    await db.collection("recordsGlobal").insertOne(record);

    const userRecords = await db
      .collection("recordsGlobal")
      .find({ userId: session.userId })
      .toArray();
    await db.collection("records").updateOne(
      {
        userId: session.userId,
      },
      { $set: { records: [...userRecords] } }
    );
    return res.sendStatus(201);
  } catch (err) {
    return res.sendStatus(422);
  }
});

server.delete("/records/:idRecord", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const tokenAuth = authorization?.replace("Bearer ", "");
    const session = await db
      .collection("sessions")
      .findOne({ token: tokenAuth });
    if (!session || !tokenAuth) {
      return res.sendStatus(401);
    }
    const { idRecord } = req.params;
    await db.collection("recordsGlobal").deleteOne({
      _id: ObjectId(idRecord),
    });
    const userRecords = await db
      .collection("recordsGlobal")
      .find({ userId: session.userId })
      .toArray();
    await db.collection("records").updateOne(
      {
        userId: session.userId,
      },
      { $set: { records: [...userRecords] } }
    );

    const listReverse = userRecords.reverse();
    return res.status(201).send(listReverse);
  } catch (err) {
    return res.sendStatus(500);
  }
});

server.get("/records/:idRecord", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const tokenAuth = authorization?.replace("Bearer ", "");
    const session = await db
      .collection("sessions")
      .findOne({ token: tokenAuth });
    if (!session || !tokenAuth) {
      return res.sendStatus(401);
    }
    const { idRecord } = req.params;
    const record = await db.collection("recordsGlobal").findOne({
      _id: ObjectId(idRecord),
    });
    return res.status(200).send(record);
  } catch (err) {
    return res.sendStatus(404);
  }
});

server.put("/records/:idRecord", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const tokenAuth = authorization?.replace("Bearer ", "");
    const session = await db
      .collection("sessions")
      .findOne({ token: tokenAuth });
    if (!session || !tokenAuth) {
      return res.sendStatus(401);
    }
    const { value, description } = req.body;
    const typeRecord = req.query.typeRecord;
    await recordSchema({ ...req.body, type: typeRecord });
    const { idRecord } = req.params;
    const record = await db.collection("recordsGlobal").findOne({
      _id: ObjectId(idRecord),
    });
    if (record) {
      await db.collection("recordsGlobal").updateOne(
        {
          _id: ObjectId(idRecord),
          userId: session.userId,
        },
        { $set: { value: value, description: description } }
      );
      const userRecords = await db
        .collection("recordsGlobal")
        .find({ userId: session.userId })
        .toArray();
      await db.collection("records").updateOne(
        {
          userId: session.userId,
        },
        { $set: { records: [...userRecords] } }
      );

      const listReverse = userRecords.reverse();
      return res.status(201).send(listReverse);
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return res.sendStatus(422);
  }
});

server.listen(5000);
