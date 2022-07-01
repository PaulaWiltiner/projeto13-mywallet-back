import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => {
  db = mongoClient.db(process.env.MONGO_DATABASE);
});

export default db;

// import db from "../database/mongon.js"
// err Cannot read properties of undefined (reading 'collection')
