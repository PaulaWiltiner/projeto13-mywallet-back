import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import oneRecordRouter from "./routes/oneRecordRouter.js";
import recordsRouter from "./routes/recordsRouter.js";
import userRouter from "./routes/userRouter.js";
import validateUserMiddleware from "./middlewares/validateUserMiddleware.js";

const server = express();
server.use(express.json(), cors());

dotenv.config();

server.use(userRouter);
server.use(validateUserMiddleware, oneRecordRouter);
server.use(validateUserMiddleware, recordsRouter);

server.listen(process.env.PORT);
