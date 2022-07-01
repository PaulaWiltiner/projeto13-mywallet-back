import {
  getOneRecord,
  updateOneRecord,
  deleteOneRecord,
} from "../controllers/oneRecordController.js";
import { Router } from "express";

const router = Router();

// oneRecordController.js
router.delete("/records/:idRecord", deleteOneRecord);
router.get("/records/:idRecord", getOneRecord);
router.put("/records/:idRecord", updateOneRecord);

export default router;
