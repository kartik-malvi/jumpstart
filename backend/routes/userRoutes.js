import express from "express";
import { protect } from "../middleware/auth.js";
import {
  init,
  getResults,
  updateResults,
  getTestProgress,
  patchTestProgress,
  postTestSubmit,
  postPaymentComplete,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/init", protect, init);
router.get("/results", protect, getResults);
router.patch("/results", protect, updateResults);
router.get("/test-progress", protect, getTestProgress);
router.patch("/test-progress", protect, patchTestProgress);
router.post("/test-submit", protect, postTestSubmit);
router.post("/payment-complete", protect, postPaymentComplete);

export default router;
