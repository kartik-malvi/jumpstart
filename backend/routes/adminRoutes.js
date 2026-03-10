import express from "express";
import { adminOnly, protect } from "../middleware/auth.js";
import {
  getLiveAdminData,
  createUserByAdmin,
  updateUserByAdmin,
  resetUserPasswordByAdmin,
  changeAdminPassword,
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

router.use(protect, adminOnly);

router.get("/packages", getPackages);
router.post("/packages", upsertPackage);
router.patch("/packages/:packageId/activate", activatePackage);

router.get("/coupons", listCoupons);
router.post("/coupons", createCoupon);
router.delete("/coupons/:couponId", deleteCoupon);

router.get("/mail-lists", listMailLists);
router.post("/mail-lists", uploadMailList);

router.get("/live-data", getLiveAdminData);
router.post("/users", createUserByAdmin);
router.patch("/users/:userId", updateUserByAdmin);
router.post("/users/:userId/reset-password", resetUserPasswordByAdmin);
router.post("/change-password", changeAdminPassword);

export default router;
