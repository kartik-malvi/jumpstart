import express from "express";
import {
  getAdminDashboard,
  getAdminUsers,
  patchAdminUser,
  deleteAdminUser,
  getAdminPayments,
  getAdminSubmissions,
  getAdminResults,
  getAdminAnalytics,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", getAdminDashboard);
router.get("/users", getAdminUsers);
router.patch("/users/:userId", patchAdminUser);
router.delete("/users/:userId", deleteAdminUser);
router.get("/payments", getAdminPayments);
router.get("/submissions", getAdminSubmissions);
router.get("/results", getAdminResults);
router.get("/analytics", getAdminAnalytics);

export default router;
