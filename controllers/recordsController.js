import dayjs from "dayjs";
import { recordSchema } from "./validationsController.js";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => {
  db = mongoClient.db(process.env.MONGO_DATABASE);
});

export async function getRecords(req, res) {
  try {
    const session = res.locals.session;
    const userList = await db
      .collection("records")
      .findOne({ userId: session.userId });
    const listRecords = userList.records;
    const listReverse = listRecords.reverse();
    return res.send(listReverse);
  } catch (err) {
    return res.sendStatus(500);
  }
}

export async function createRecords(req, res) {
  try {
    const session = res.locals.session;
    const { value, description } = req.body;
    const typeRecord = req.query.typeRecord;
    await recordSchema({ ...req.body, type: typeRecord });
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
}
