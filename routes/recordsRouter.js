import { createRecords, getRecords } from "../controllers/recordsController.js";
import { Router } from "express";

const router = Router();

// recordsController.js
router.get("/records", getRecords);
router.post("/records", createRecords);

export default router;
