import ObjectId from "bson-objectid";
import { recordSchema } from "./validationsController.js";
import { db } from "../database/mongo.js";

export async function deleteOneRecord(req, res) {
  try {
    const { session } = res.locals;
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
}

export async function getOneRecord(req, res) {
  try {
    const { idRecord } = req.params;
    const record = await db.collection("recordsGlobal").findOne({
      _id: ObjectId(idRecord),
    });
    return res.status(200).send(record);
  } catch (err) {
    return res.sendStatus(404);
  }
}

export async function updateOneRecord(req, res) {
  try {
    const { session } = res.locals;
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
}
