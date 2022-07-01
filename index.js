import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import oneRecordRouter from "./routes/oneRecordRouter.js";
import recordsRouter from "./routes/recordsRouter.js";
import userRouter from "./routes/userRouter.js";

const server = express();
server.use(express.json(), cors());

dotenv.config();

server.use(oneRecordRouter);
server.use(recordsRouter);
server.use(userRouter);

server.listen(process.env.PORT);
