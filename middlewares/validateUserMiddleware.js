import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => {
  db = mongoClient.db(process.env.MONGO_DATABASE);
});

async function validateUser(req, res, next) {
  const { authorization } = req.headers;
  const tokenAuth = authorization?.replace("Bearer ", "");
  const session = await db.collection("sessions").findOne({ token: tokenAuth });
  if (!session || !tokenAuth) {
    return res.sendStatus(401);
  }
  res.locals.session = session;
  next();
}

export default validateUser;
