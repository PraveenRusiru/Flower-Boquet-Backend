import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { createLibrary, deleteImageFromLibrary, deleteLibrary, findByName, getAllLibraries, getLibraries, updateImagesToLibrary, updateTitle } from "../controller/library.controller";
import { get } from "http";

const router = Router();

router.post("/create", authenticate,upload.array("image", 1), createLibrary);
router.post("/get",getLibraries);
router.get("/getAll",getAllLibraries);
router.put("/updateTitle", authenticate, updateTitle);
router.delete("/delete", authenticate, deleteLibrary ); // deleteLibrary function to be added
router.delete("/deleteImg", authenticate, deleteImageFromLibrary)
router.put("/updateImg", authenticate, upload.array("image", 1), updateImagesToLibrary); // updateImages function to be added
router.post("/findByName", authenticate, findByName);
export default router;