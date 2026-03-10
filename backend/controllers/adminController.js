import User from "../models/User.js";

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

export const getLiveAdminData = async (req, res) => {
  try {
    const users = await User.find({})
      .select(
        "name email mobile subscription testsCompleted testsInProgress reportsReady resultProfile testProgress payments activities lastLoginAt createdAt updatedAt"
      )
      .lean();

    const usersTable = users.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      phone: u.mobile || "-",
      initials: toInitials(u.name),
      tests: u.testsCompleted || 0,
      subscription: u.subscription || "Basic",
      lastLoginAt: u.lastLoginAt || null,
      status: "Active",
    }));

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

    const kpis = {
      totalUsers: users.length,
      testsPurchased: payments.filter((p) => p.status === "Completed").length,
      completedTests: users.reduce((sum, u) => sum + (u.testsCompleted || 0), 0),
      revenue: totalRevenue,
      revenueLabel: formatRupees(totalRevenue),
    };

    return res.status(200).json({
      success: true,
      data: {
        kpis,
        users: usersTable,
        payments,
        submissions,
        publishedResults,
        recentActivity,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Admin live data error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to load admin data" });
  }
};
