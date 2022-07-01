import dayjs from "dayjs";
import { recordSchema } from "./validationsController.js";
import { db } from "../database/mongo.js";

export async function getRecords(req, res) {
  try {
    const { session } = res.locals;
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
    const { session } = res.locals;
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
