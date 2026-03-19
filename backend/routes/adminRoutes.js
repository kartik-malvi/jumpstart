import express from "express";
import { adminOnly, protect } from "../middleware/auth.js";
import {
  getLiveAdminData,
  clearAllActivityLogs,
  deleteSelectedActivityLogs,
  deleteSubmissionByAdmin,
  approveSubmissionByAdmin,
  getPublishedResultByAdmin,
  deleteUserByAdmin,
  createUserByAdmin,
  updateUserByAdmin,
  resetUserPasswordByAdmin,
  changeAdminPassword,
} from "../controllers/adminController.js";
import {
  getPackages,
  upsertPackage,
  activatePackage,
  deletePackage,
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
router.delete("/packages/:packageId", deletePackage);

router.get("/coupons", listCoupons);
router.post("/coupons", createCoupon);
router.delete("/coupons/:couponId", deleteCoupon);

router.get("/mail-lists", listMailLists);
router.post("/mail-lists", uploadMailList);

router.get("/live-data", getLiveAdminData);
router.get("/results/:userId", getPublishedResultByAdmin);
router.delete("/activity-logs", clearAllActivityLogs);
router.post("/activity-logs/delete-selected", deleteSelectedActivityLogs);
router.patch("/submissions/:userId/approve", approveSubmissionByAdmin);
router.delete("/submissions/:userId", deleteSubmissionByAdmin);
router.post("/users", createUserByAdmin);
router.delete("/users/:userId", deleteUserByAdmin);
router.patch("/users/:userId", updateUserByAdmin);
router.post("/users/:userId/reset-password", resetUserPasswordByAdmin);
router.post("/change-password", changeAdminPassword);

export default router;
