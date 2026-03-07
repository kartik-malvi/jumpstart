import User from "../models/User.js";
import AssessmentConfig from "../models/AssessmentConfig.js";

const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const shortAgo = (d) => {
  if (!d) return "Never";
  const now = Date.now();
  const ts = new Date(d).getTime();
  if (Number.isNaN(ts)) return "Never";
  const diff = Math.max(0, Math.floor((now - ts) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const monthKey = (d) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, 1);
  return dt.toLocaleString("en-IN", { month: "short" });
};

const getConfigLookup = (cfg) => {
  const map = new Map();
  for (const p of cfg?.packages || []) map.set(p.id, p);
  return map;
};

const buildPayments = (users, packageMap) => {
  const rows = [];
  for (const u of users) {
    const purchases = Array.isArray(u.purchasedPackages) ? u.purchasedPackages : [];
    purchases.forEach((pkgId, idx) => {
      const pkg = packageMap.get(pkgId);
      const amount = Number(pkg?.amount || 0);
      rows.push({
        id: `${String(u._id).slice(-6).toUpperCase()}-${String(pkgId).toUpperCase()}-${idx + 1}`,
        userId: String(u._id),
        name: u.name || "Unknown",
        email: u.email || "",
        package: pkg?.title || pkgId,
        amount,
        amountLabel: fmtCurrency(amount),
        method: idx % 2 === 0 ? "UPI" : "Card",
        status: "Completed",
        date: u.updatedAt || u.createdAt,
      });
    });
  }
  return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const toInitials = (name = "") =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "NA";

// GET /api/v1/admin/dashboard
export const getAdminDashboard = async (req, res) => {
  try {
    const [users, cfg] = await Promise.all([User.find({ role: { $ne: "admin" } }).lean(), AssessmentConfig.getOrCreateDefault()]);
    const packageMap = getConfigLookup(cfg);
    const payments = buildPayments(users, packageMap);
    const completedTests = users.reduce((sum, u) => sum + Number(u.testsCompleted || 0), 0);
    const revenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const now = new Date();
    const growthData = [];
    const revenueData = [];
    for (let i = 5; i >= 0; i -= 1) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(dt);
      const label = dt.toLocaleString("en-IN", { month: "short" });
      const registered = users.filter((u) => monthKey(u.createdAt || now) === key).length;
      const monthRevenue = payments
        .filter((p) => monthKey(p.date || now) === key)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      growthData.push({ name: label, value: registered });
      revenueData.push({ name: label, value: monthRevenue });
    }

    const recentActivities = [
      ...payments.slice(0, 5).map((p, idx) => ({
        id: `pay-${idx}`,
        time: shortAgo(p.date),
        user: p.name,
        action: `Payment received (${p.package})`,
        status: "Completed",
      })),
      ...users
        .filter((u) => Number(u.testsCompleted || 0) > 0)
        .slice(0, 5)
        .map((u, idx) => ({
          id: `test-${idx}`,
          time: shortAgo(u.updatedAt),
          user: u.name || "Unknown",
          action: "Completed test",
          status: "Completed",
        })),
    ]
      .sort((a, b) => {
        const av = String(a.time).includes("s") ? 1 : String(a.time).includes("m") ? 2 : 3;
        const bv = String(b.time).includes("s") ? 1 : String(b.time).includes("m") ? 2 : 3;
        return av - bv;
      })
      .slice(0, 8);

    return res.status(200).json({
      success: true,
      data: {
        kpiData: [
          { title: "Total Users", value: users.length },
          { title: "Tests Purchased", value: payments.length },
          { title: "Completed Tests", value: completedTests },
          { title: "Revenue", value: fmtCurrency(revenue) },
        ],
        growthData,
        revenueData,
        recentActivities,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Failed to load admin dashboard" });
  }
};

// GET /api/v1/admin/users
export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("name email mobile testsCompleted subscription lastLoginAt isSuspended createdAt selectedPackageId")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({
      success: true,
      data: users.map((u) => ({
        id: String(u._id),
        name: u.name || "Unknown",
        email: u.email || "",
        phone: u.mobile || "",
        initials: toInitials(u.name),
        tests: Number(u.testsCompleted || 0),
        subscription: u.subscription || "Basic",
        lastLogin: shortAgo(u.lastLoginAt),
        status: u.isSuspended ? "Suspended" : "Active",
        packageId: u.selectedPackageId || "",
      })),
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Failed to load users" });
  }
};

// PATCH /api/v1/admin/users/:userId
export const patchAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, mobile, subscription, status } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (mobile !== undefined) update.mobile = String(mobile).trim();
    if (subscription !== undefined) update.subscription = subscription;
    if (status !== undefined) update.isSuspended = String(status) === "Suspended";
    const user = await User.findOneAndUpdate({ _id: userId, role: { $ne: "admin" } }, { $set: update }, { new: true })
      .select("name email mobile testsCompleted subscription lastLoginAt isSuspended selectedPackageId")
      .lean();
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    return res.status(200).json({
      success: true,
      data: {
        id: String(user._id),
        name: user.name || "Unknown",
        email: user.email || "",
        phone: user.mobile || "",
        initials: toInitials(user.name),
        tests: Number(user.testsCompleted || 0),
        subscription: user.subscription || "Basic",
        lastLogin: shortAgo(user.lastLoginAt),
        status: user.isSuspended ? "Suspended" : "Active",
        packageId: user.selectedPackageId || "",
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Failed to update user" });
  }
};

// DELETE /api/v1/admin/users/:userId
export const deleteAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOneAndDelete({ _id: userId, role: { $ne: "admin" } }).lean();
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    return res.status(200).json({ success: true, data: { id: String(user._id) } });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Failed to delete user" });
  }
};

// GET /api/v1/admin/payments
export const getAdminPayments = async (req, res) => {
  try {
    const [users, cfg] = await Promise.all([
      User.find({ role: { $ne: "admin" } }).select("name email purchasedPackages updatedAt createdAt").lean(),
      AssessmentConfig.getOrCreateDefault(),
    ]);
    const packageMap = getConfigLookup(cfg);
    const payments = buildPayments(users, packageMap);
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonth = payments.filter((p) => new Date(p.date) >= startOfMonth).reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalRevenueLabel: fmtCurrency(totalRevenue),
          thisMonth,
          thisMonthLabel: fmtCurrency(thisMonth),
          pendingAmount: 0,
          pendingAmountLabel: fmtCurrency(0),
          refundedAmount: 0,
          refundedAmountLabel: fmtCurrency(0),
        },
        rows: payments.map((p) => ({
          ...p,
          dateLabel: fmtDate(p.date),
        })),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Failed to load payments" });
  }
};

// GET /api/v1/admin/submissions
export const getAdminSubmissions = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("name email subscription resultProfile testsCompleted updatedAt createdAt")
      .lean();

    const rows = users
      .filter((u) => Number(u.testsCompleted || 0) > 0 || (u.resultProfile?.testResults || []).length > 0)
      .map((u) => {
        const testResults = Array.isArray(u.resultProfile?.testResults) ? u.resultProfile.testResults : [];
        const lastResult = testResults[testResults.length - 1] || {};
        return {
          id: String(u._id),
          name: u.name || "Unknown",
          email: u.email || "",
          initials: toInitials(u.name),
          type: u.subscription || "Basic",
          date: fmtDate(lastResult.completedAt || u.updatedAt || u.createdAt),
          duration: "N/A",
          status: u.resultProfile?.overallScore != null ? "Scored" : "Submitted",
        };
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Failed to load submissions" });
  }
};

// GET /api/v1/admin/results
export const getAdminResults = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("name email subscription resultProfile updatedAt")
      .lean();
    const rows = users
      .filter((u) => u.resultProfile?.overallScore != null)
      .map((u) => ({
        id: String(u._id),
        name: u.name || "Unknown",
        email: u.email || "",
        initials: toInitials(u.name),
        type: u.subscription || "Basic",
        date: fmtDate(u.updatedAt),
        score: `${Number(u.resultProfile?.overallScore || 0)}/100`,
        percentile: String(u.resultProfile?.overallPercentile || "").replace("Top ", ""),
        rawResult: u.resultProfile || {},
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Failed to load results" });
  }
};

// GET /api/v1/admin/analytics
export const getAdminAnalytics = async (req, res) => {
  try {
    const [users, cfg] = await Promise.all([User.find({ role: { $ne: "admin" } }).lean(), AssessmentConfig.getOrCreateDefault()]);
    const packageMap = getConfigLookup(cfg);
    const payments = buildPayments(users, packageMap);

    const registered = users.length;
    const started = users.filter((u) => Object.keys(u.testProgress?.answers || {}).length > 0).length;
    const completed = users.filter((u) => Number(u.testsCompleted || 0) > 0).length;
    const paid = users.filter((u) => (u.purchasedPackages || []).length > 0).length;
    const counselling = users.filter((u) => Number(u.counsellingSessions || 0) > 0).length;

    const completionByPackage = (cfg.packages || []).map((p) => {
      const buyers = users.filter((u) => (u.purchasedPackages || []).includes(p.id));
      const done = buyers.filter((u) => Number(u.testsCompleted || 0) > 0).length;
      return { name: p.title, started: buyers.length, completed: done };
    });
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const revenueByPackage = (cfg.packages || []).map((p) => {
      const amount = payments.filter((pm) => pm.package === p.title).reduce((s, pm) => s + Number(pm.amount || 0), 0);
      const value = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
      return { name: p.title, value };
    });

    const regMap = new Map();
    users.forEach((u) => {
      const key = monthKey(u.createdAt || new Date());
      regMap.set(key, (regMap.get(key) || 0) + 1);
    });
    const regKeys = [...regMap.keys()].sort().slice(-7);
    const registrationTrend = regKeys.map((k) => ({ date: monthLabel(k), value: regMap.get(k) || 0 }));

    const careerCounts = new Map();
    users.forEach((u) => {
      const top = Array.isArray(u.resultProfile?.careerRecommendations) ? u.resultProfile.careerRecommendations : [];
      top.forEach((c) => {
        const title = c.title || "Unknown";
        careerCounts.set(title, (careerCounts.get(title) || 0) + 1);
      });
    });
    const careerPaths = [...careerCounts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const avgScoreUsers = users.filter((u) => u.resultProfile?.overallScore != null);
    const avgScore =
      avgScoreUsers.length > 0
        ? (avgScoreUsers.reduce((sum, u) => sum + Number(u.resultProfile?.overallScore || 0), 0) / avgScoreUsers.length).toFixed(1)
        : "0.0";

    return res.status(200).json({
      success: true,
      data: {
        funnel: { registered, started, completed, paid, counselling },
        completionData: completionByPackage,
        revenueDistribution: revenueByPackage,
        registrationTrend,
        careerPaths,
        performanceMetrics: [
          { metric: "Avg. Score", current: `${avgScore}/100`, previous: "-", change: "-", trend: "up" },
          { metric: "Users Completed", current: String(completed), previous: "-", change: "-", trend: "up" },
          { metric: "Payments", current: String(payments.length), previous: "-", change: "-", trend: "up" },
        ],
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Failed to load analytics" });
  }
};
