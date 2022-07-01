import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { signUp, signIn } from "./controllers/userController.js";
import { createRecords, getRecords } from "./controllers/recordsController.js";
import {
  getOneRecord,
  updateOneRecord,
  deleteOneRecord,
} from "./controllers/oneRecordController.js";

const server = express();
server.use(express.json(), cors());

dotenv.config();

// userController.js
server.post("/sign-up", signUp);
server.post("/sign-in", signIn);

// recordsController.js
server.get("/records", getRecords);
server.post("/records", createRecords);

// oneRecordController.js
server.delete("/records/:idRecord", deleteOneRecord);
server.get("/records/:idRecord", getOneRecord);
server.put("/records/:idRecord", updateOneRecord);

server.listen(process.env.PORT);
