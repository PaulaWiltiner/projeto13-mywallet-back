import { db } from "../database/mongo.js";

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
