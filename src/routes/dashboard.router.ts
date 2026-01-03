import { Router } from "express";
import { getAllStats } from "../controller/dashboard.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/stats",authenticate,getAllStats);

export default router;