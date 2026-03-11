import { Router,Request,Response } from "express";
import { generateGiftImage } from "../controller/ai.controller";
import { authenticate } from "../middleware/auth";
    // import fs from "fs";
// import OpenAI from "openai";
const router = Router();

router.post("/generate" ,generateGiftImage);

export default router;
