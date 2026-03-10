import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getLiveAdminData,
} from "../controllers/adminController.js";
import {
  getPackages,
  upsertPackage,
  activatePackage,
} from "../controllers/packageController.js";
import {
  listCoupons,
  createCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import {
  listMailLists,
  uploadMailList,
} from "../controllers/mailListController.js";

const router = express.Router();

router.get("/packages", protect, getPackages);
router.post("/packages", protect, upsertPackage);
router.patch("/packages/:packageId/activate", protect, activatePackage);

router.get("/coupons", protect, listCoupons);
router.post("/coupons", protect, createCoupon);
router.delete("/coupons/:couponId", protect, deleteCoupon);

router.get("/mail-lists", protect, listMailLists);
router.post("/mail-lists", protect, uploadMailList);

router.get("/live-data", protect, getLiveAdminData);

export default router;
