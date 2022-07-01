import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
var db;
mongoClient.connect().then(() => {
  db = mongoClient.db(process.env.MONGO_DATABASE);
  console.log(process.env.MONGO_DATABASE, db);
});

export { db };

// import db from "../database/mongo.js" para controllers e middlewares
// err Cannot read properties of undefined (reading 'collection')
