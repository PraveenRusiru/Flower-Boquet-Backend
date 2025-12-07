import { Router } from "express";
import { createGift ,updateGift, deleteImage,updateImages} from "../controller/gift.controller";
import {upload} from "../middleware/upload";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/create", authenticate, upload.array("image", 4), createGift);
router.post("/updateDetails", authenticate, updateGift);
router.delete("/deleteImages",authenticate, deleteImage);
router.put("/updateImages",authenticate, upload.array("image", 1), updateImages);
export default router;