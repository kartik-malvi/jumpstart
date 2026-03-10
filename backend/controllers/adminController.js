import User from "../models/User.js";

const ACTIVITY_LIMIT = 100;

const toInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("");

const formatRupees = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getSubmissionStatus = (user) => {
  if ((user.testsCompleted || 0) > 0) return "Scored";
  if ((user.testsInProgress || 0) > 0) return "In Review";
  return "Submitted";
};

const getSubmissionDate = (user) => {
  const testResultDate = user.resultProfile?.testResults?.[0]?.completedAt;
  const progressDate = user.testProgress?.updatedAt;
  return testResultDate || progressDate || user.updatedAt || user.createdAt;
};

const buildMonthlySeries = (users, payments) => {
  const months = new Map();
  const now = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${dt.getFullYear()}-${dt.getMonth()}`;
    months.set(key, {
      name: dt.toLocaleString("en-US", { month: "short" }),
      userGrowth: 0,
      revenue: 0,
    });
  }

  users.forEach((user) => {
    const dt = user.createdAt ? new Date(user.createdAt) : null;
    if (!dt || Number.isNaN(dt.getTime())) return;
    const key = `${dt.getFullYear()}-${dt.getMonth()}`;
    const entry = months.get(key);
    if (entry) entry.userGrowth += 1;
  });

  payments.forEach((payment) => {
    if (payment.status !== "Completed") return;
    const dt = payment.date ? new Date(payment.date) : null;
    if (!dt || Number.isNaN(dt.getTime())) return;
    const key = `${dt.getFullYear()}-${dt.getMonth()}`;
    const entry = months.get(key);
    if (entry) entry.revenue += Number(payment.amount || 0);
  });

  return Array.from(months.values());
};

const buildRegistrationTrend = (users) => {
  const days = new Map();
  const now = new Date();

  for (let i = 6; i >= 0; i -= 1) {
    const dt = new Date(now);
    dt.setHours(0, 0, 0, 0);
    dt.setDate(now.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    days.set(key, {
      date: dt.toLocaleString("en-US", { month: "short", day: "numeric" }),
      value: 0,
    });
  }

  users.forEach((user) => {
    const dt = user.createdAt ? new Date(user.createdAt) : null;
    if (!dt || Number.isNaN(dt.getTime())) return;
    const key = dt.toISOString().slice(0, 10);
    const entry = days.get(key);
    if (entry) entry.value += 1;
  });

  return Array.from(days.values());
};

const buildSubscriptionBreakdown = (users) => {
  const counts = { Basic: 0, Standard: 0, Premium: 0 };
  users.forEach((user) => {
    const key = user.subscription || "Basic";
    counts[key] = (counts[key] || 0) + 1;
  });

  return [
    { name: "Standard", value: counts.Standard, color: "#b2e9e1" },
    { name: "Premium", value: counts.Premium, color: "#0f766e" },
    { name: "Basic", value: counts.Basic, color: "#14b8a6" },
  ];
};

const buildTopCareers = (users) => {
  const careerMap = new Map();
  users.forEach((user) => {
    (user.resultProfile?.careerRecommendations || []).forEach((career) => {
      const key = career.title || "Unknown";
      careerMap.set(key, (careerMap.get(key) || 0) + 1);
    });
  });

  return Array.from(careerMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
};

const pushActivity = (user, activity) => {
  user.activities = user.activities || [];
  user.activities.push({
    action: activity.action || "Activity",
    status: activity.status || "Completed",
    type: activity.type || "other",
    createdAt: activity.createdAt || new Date(),
  });
  if (user.activities.length > ACTIVITY_LIMIT) {
    user.activities = user.activities.slice(-ACTIVITY_LIMIT);
  }
};

const sanitizeUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  phone: user.mobile || "-",
  initials: toInitials(user.name),
  tests: user.testsCompleted || 0,
  subscription: user.subscription || "Basic",
  lastLoginAt: user.lastLoginAt || null,
  status: user.status || "Active",
  role: user.role || "user",
  createdAt: user.createdAt,
});

const buildAdminPayload = (users) => {
  const usersTable = users.map(sanitizeUser);

  const payments = users
    .flatMap((u) =>
      (u.payments || []).map((p) => ({
        id: p.orderId,
        userId: String(u._id),
        name: u.name,
        email: u.email,
        initials: toInitials(u.name),
        package: p.packageName,
        amount: Number(p.amount || 0),
        amountLabel: formatRupees(p.amount),
        method: p.method || "UPI",
        date: p.createdAt,
        status: p.status || "Completed",
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const submissions = users
    .filter((u) => (u.testsCompleted || 0) > 0 || (u.testProgress && u.testProgress.updatedAt))
    .map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      initials: toInitials(u.name),
      type: u.subscription || "Basic",
      date: getSubmissionDate(u),
      duration: "--",
      status: getSubmissionStatus(u),
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const publishedResults = users
    .filter((u) => u.resultProfile && u.resultProfile.overallScore != null)
    .map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      initials: toInitials(u.name),
      type: u.subscription || "Basic",
      date: u.updatedAt,
      score: `${u.resultProfile.overallScore}/100`,
      percentile: u.resultProfile.overallPercentile || "--",
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const recentActivity = users
    .flatMap((u) =>
      (u.activities || []).map((a, idx) => ({
        id: `${u._id}-${idx}-${new Date(a.createdAt).getTime()}`,
        date: a.createdAt,
        user: u.name,
        action: a.action,
        status: a.status || "Completed",
        type: a.type || "other",
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 15);

  const totalRevenue = payments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return {
    kpis: {
      totalUsers: users.filter((u) => u.role !== "admin").length,
      adminUsers: users.filter((u) => u.role === "admin").length,
      testsPurchased: payments.filter((p) => p.status === "Completed").length,
      completedTests: users.reduce((sum, u) => sum + (u.testsCompleted || 0), 0),
      revenue: totalRevenue,
      revenueLabel: formatRupees(totalRevenue),
    },
    users: usersTable,
    payments,
    submissions,
    publishedResults,
    recentActivity,
    analytics: {
      completionByPackage: [
        {
          name: "Basic",
          started: users.filter((u) => u.subscription === "Basic").length,
          completed: users.filter((u) => u.subscription === "Basic" && (u.testsCompleted || 0) > 0).length,
        },
        {
          name: "Standard",
          started: users.filter((u) => u.subscription === "Standard").length,
          completed: users.filter((u) => u.subscription === "Standard" && (u.testsCompleted || 0) > 0).length,
        },
        {
          name: "Premium",
          started: users.filter((u) => u.subscription === "Premium").length,
          completed: users.filter((u) => u.subscription === "Premium" && (u.testsCompleted || 0) > 0).length,
        },
      ],
      revenueDistribution: buildSubscriptionBreakdown(
        payments
          .filter((p) => p.status === "Completed")
          .map((payment) => users.find((user) => String(user._id) === payment.userId))
          .filter(Boolean)
      ),
      registrationTrend: buildRegistrationTrend(users),
      topCareers: buildTopCareers(users),
      monthlySeries: buildMonthlySeries(users, payments),
    },
    updatedAt: new Date().toISOString(),
  };
};

const loadUsers = () =>
  User.find({})
    .select(
      "name email mobile subscription role status testsCompleted testsInProgress reportsReady resultProfile testProgress payments activities lastLoginAt createdAt updatedAt"
    )
    .lean();

export const getLiveAdminData = async (req, res) => {
  try {
    const users = await loadUsers();
    return res.status(200).json({ success: true, data: buildAdminPayload(users) });
  } catch (err) {
    console.error("Admin live data error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to load admin data" });
  }
};

export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, mobile, subscription, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, msg: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, msg: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, msg: "User with this email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      mobile: (mobile || "").trim(),
      subscription: ["Basic", "Standard", "Premium"].includes(subscription) ? subscription : "Basic",
      role: role === "admin" ? "admin" : "user",
      status: "Active",
    });

    pushActivity(user, {
      action: `Created by admin ${req.user.email}`,
      status: "Completed",
      type: "auth",
    });
    await user.save();

    return res.status(201).json({ success: true, data: { user: sanitizeUser(user) } });
  } catch (err) {
    console.error("Create admin user error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to create user" });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, mobile, subscription, status, role } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: userId } });
      if (existing) {
        return res.status(409).json({ success: false, msg: "Another user already uses this email" });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name !== undefined) user.name = name.trim();
    if (mobile !== undefined) user.mobile = `${mobile}`.trim();
    if (["Basic", "Standard", "Premium"].includes(subscription)) user.subscription = subscription;
    if (["Active", "Suspended"].includes(status)) user.status = status;
    if (role === "admin" || role === "user") user.role = role;

    pushActivity(user, {
      action: `Updated by admin ${req.user.email}`,
      status: "Completed",
      type: "other",
    });

    await user.save();
    return res.status(200).json({ success: true, data: { user: sanitizeUser(user) } });
  } catch (err) {
    console.error("Update admin user error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to update user" });
  }
};

export const resetUserPasswordByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, msg: "Password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    user.password = password;
    pushActivity(user, {
      action: `Password reset by admin ${req.user.email}`,
      status: "Completed",
      type: "auth",
    });
    await user.save();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Reset admin user password error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to reset password" });
  }
};

export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, msg: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, msg: "This account does not use password login" });
    }

    const valid = await user.comparePassword(currentPassword || "");
    if (!valid) {
      return res.status(400).json({ success: false, msg: "Current password is incorrect" });
    }

    user.password = newPassword;
    pushActivity(user, {
      action: "Changed password",
      status: "Completed",
      type: "auth",
    });
    await user.save();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Change admin password error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to change password" });
  }
};
