import User from "../models/User.js";

const ACTIVITY_LIMIT = 100;

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

const isSubmissionApproved = (user) => user?.submissionApprovalStatus === "approved";

const DEFAULT_AVAILABLE_TESTS = [
  { title: "Aptitude Assessment", durationMinutes: 22, totalQuestions: 30, status: "not_started" },
  { title: "Interest", durationMinutes: 20, totalQuestions: 30, status: "not_started" },
  { title: "Personality", durationMinutes: 25, totalQuestions: 30, status: "not_started" },
  { title: "Values", durationMinutes: 20, totalQuestions: 30, status: "not_started" },
];

// GET /api/v1/user/init - dashboard stats (protected)
export const init = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select(
        "name email testsCompleted testsInProgress reportsReady counsellingSessions availableTests topCareers resultProfile submissionApprovalStatus"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    let availableTests = Array.isArray(user.availableTests) ? user.availableTests : [];
    if (availableTests.length === 0) {
      availableTests = DEFAULT_AVAILABLE_TESTS;
    }

    // Prefer career matches from resultProfile (test results) over user.topCareers
    const approved = isSubmissionApproved(user);
    let topCareers = [];
    const profile = user.resultProfile || {};
    if (approved && Array.isArray(profile.careerRecommendations) && profile.careerRecommendations.length > 0) {
      topCareers = profile.careerRecommendations.map((c) => ({
        title: c.title,
        matchPercent: c.matchPercent,
      }));
    } else if (approved && Array.isArray(user.topCareers) && user.topCareers.length > 0) {
      topCareers = user.topCareers;
    }

    const testsCompleted = approved ? user.testsCompleted ?? 0 : 0;
    const reportsReady = approved ? (profile.testResults?.length ?? user.reportsReady ?? testsCompleted) : 0;

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        tests_completed: testsCompleted,
        tests_in_progress: user.testsInProgress ?? 0,
        reports_ready: reportsReady,
        counselling_sessions: user.counsellingSessions ?? 0,
        available_tests: availableTests,
        top_careers: topCareers,
        submission_approved: approved,
        submission_status: approved ? "approved" : (user.testsCompleted || 0) > 0 ? "pending" : "not_submitted",
      },
    });
  } catch (err) {
    console.error("User init error:", err);
    res.status(500).json({
      success: false,
      msg: err.message || "Failed to load dashboard",
    });
  }
};

// GET /api/v1/user/results - results page data (protected)
export const getResults = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("resultProfile testsCompleted submissionApprovalStatus")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    const profile = user.resultProfile || {};
    const approved = isSubmissionApproved(user);
    const hasAnyResults = approved && (
      (profile.testResults && profile.testResults.length > 0) ||
      (profile.strengths && profile.strengths.length > 0) ||
      (profile.careerRecommendations && profile.careerRecommendations.length > 0) ||
      (profile.personalityType && profile.personalityType.code)
    );

    return res.status(200).json({
      success: true,
      data: {
        hasResults: !!hasAnyResults,
        submissionApproved: approved,
        submissionStatus: approved ? "approved" : (user.testsCompleted || 0) > 0 ? "pending" : "not_submitted",
        overallScore: approved ? profile.overallScore ?? null : null,
        overallPercentile: approved ? profile.overallPercentile || "" : "",
        completedTestsCount: approved ? profile.completedTestsCount ?? user.testsCompleted ?? 0 : 0,
        totalTestsCount: approved ? profile.totalTestsCount ?? 0 : 0,
        careerPathwaysCount: approved ? profile.careerPathwaysCount ?? 0 : 0,
        testResults: approved && Array.isArray(profile.testResults) ? profile.testResults : [],
        strengths: approved && Array.isArray(profile.strengths) ? profile.strengths : [],
        careerRecommendations: approved && Array.isArray(profile.careerRecommendations)
          ? profile.careerRecommendations
          : [],
        personalityType: approved ? profile.personalityType || null : null,
      },
    });
  } catch (err) {
    console.error("Get results error:", err);
    res.status(500).json({
      success: false,
      msg: err.message || "Failed to load results",
    });
  }
};

// PATCH /api/v1/user/results - update result profile (protected)
export const updateResults = async (req, res) => {
  try {
    const allowed = [
      "overallScore", "overallPercentile", "completedTestsCount", "totalTestsCount", "careerPathwaysCount",
      "testResults", "strengths", "careerRecommendations", "personalityType",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[`resultProfile.${key}`] = req.body[key];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, msg: "No valid fields to update" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("resultProfile");
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    return res.status(200).json({
      success: true,
      data: { resultProfile: user.resultProfile },
    });
  } catch (err) {
    console.error("Update results error:", err);
    res.status(500).json({
      success: false,
      msg: err.message || "Failed to update results",
    });
  }
};

// GET /api/v1/user/test-progress - get livetest progress (protected)
export const getTestProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("testProgress").lean();
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    const p = user.testProgress || {};
    return res.status(200).json({
      success: true,
      data: {
        sectionId: p.sectionId ?? 1,
        questionIndex: p.questionIndex ?? 0,
        answers: p.answers || {},
        timeRemainingSeconds: p.timeRemainingSeconds,
      },
    });
  } catch (err) {
    console.error("Get test progress error:", err);
    res.status(500).json({ success: false, msg: err.message || "Failed to load progress" });
  }
};

// PATCH /api/v1/user/test-progress - save livetest progress (protected)
export const patchTestProgress = async (req, res) => {
  try {
    const { sectionId, questionIndex, answers, timeRemainingSeconds } = req.body;
    const update = { "testProgress.updatedAt": new Date() };
    if (sectionId !== undefined) update["testProgress.sectionId"] = sectionId;
    if (questionIndex !== undefined) update["testProgress.questionIndex"] = questionIndex;
    if (answers !== undefined) update["testProgress.answers"] = answers;
    if (timeRemainingSeconds !== undefined) update["testProgress.timeRemainingSeconds"] = timeRemainingSeconds;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    if ((user.testsInProgress || 0) === 0) {
      update.testsInProgress = 1;
      pushActivity(user, {
        action: "Started test",
        status: "In Progress",
        type: "test",
      });
    }

    Object.entries(update).forEach(([path, value]) => {
      if (path.includes(".")) {
        const [root, nested] = path.split(".");
        user[root] = user[root] || {};
        user[root][nested] = value;
      } else {
        user[path] = value;
      }
    });

    await user.save();
    return res.status(200).json({ success: true, data: { ok: true } });
  } catch (err) {
    console.error("Patch test progress error:", err);
    res.status(500).json({ success: false, msg: err.message || "Failed to save progress" });
  }
};

// Compute dummy result profile from answers (Likert 1-5 per question)
function computeResultFromAnswers(answers) {
  if (!answers || typeof answers !== "object") return null;
  const keys = Object.keys(answers).filter((k) => typeof answers[k] === "number");
  if (keys.length === 0) return null;
  const sum = keys.reduce((s, k) => s + answers[k], 0);
  const avg = sum / keys.length;
  const overallScore = Math.round((avg / 5) * 100);
  const sectionNames = ["Aptitude Assessment", "Interest", "Personality", "Values"];
  const testResults = sectionNames.map((name, i) => ({
    testName: name,
    completedAt: new Date(),
    score: Math.min(100, Math.round(overallScore + (i - 2) * 3)),
    maxScore: 100,
    reportUrl: "",
  }));
  const strengths = [
    { name: "Analytical Thinking", value: Math.min(100, Math.round(avg * 20)), desc: "Based on your aptitude responses" },
    { name: "Creative Problem Solving", value: Math.min(100, Math.round(avg * 18)), desc: "Strong creative thinking" },
    { name: "Communication", value: Math.min(100, Math.round(avg * 17)), desc: "Good ability to express ideas" },
    { name: "Technical Aptitude", value: Math.min(100, Math.round(avg * 19)), desc: "Technical concepts and systems" },
    { name: "Leadership Potential", value: Math.min(100, Math.round(avg * 16)), desc: "Developing leadership skills" },
  ];
  const careerRecommendations = [
    { title: "Data Scientist", matchPercent: Math.min(99, 70 + Math.round(avg * 5)), description: "Analyze complex data sets to extract insights", skills: ["Python", "Statistics", "Machine Learning"], salaryRange: "₹8-15 LPA" },
    { title: "UX Designer", matchPercent: Math.min(99, 65 + Math.round(avg * 5)), description: "Create user-centered digital experiences", skills: ["Figma", "User Research", "Prototyping"], salaryRange: "₹6-12 LPA" },
    { title: "Business Analyst", matchPercent: Math.min(99, 60 + Math.round(avg * 5)), description: "Bridge business needs with technology", skills: ["SQL", "Excel", "Business Strategy"], salaryRange: "₹5-10 LPA" },
  ];
  const personalityType = {
    code: "INTJ-A",
    title: "The Architect",
    description: "Strategic, independent thinker with a natural drive for implementing innovative ideas",
    traits: [
      { name: "Introversion", value: Math.min(100, Math.round(avg * 18)) },
      { name: "Intuition", value: Math.min(100, Math.round(avg * 20)) },
      { name: "Thinking", value: Math.min(100, Math.round(avg * 21)) },
      { name: "Judging", value: Math.min(100, Math.round(avg * 19)) },
    ],
  };
  return {
    overallScore,
    overallPercentile: `Top ${Math.max(5, 100 - overallScore)}% nationally`,
    completedTestsCount: 4,
    totalTestsCount: 4,
    careerPathwaysCount: 15,
    testResults,
    strengths,
    careerRecommendations,
    personalityType,
  };
}

function computeResultFromScoring(scoring) {
  if (!scoring || typeof scoring !== "object") return null;
  const totalMarks = Number(scoring.totalMarks) || 0;
  const obtainedMarks = Number(scoring.obtainedMarks) || 0;
  if (totalMarks <= 0) return null;

  const overallScore = Math.max(0, Math.min(100, Math.round((obtainedMarks / totalMarks) * 100)));
  const sectionScores = Array.isArray(scoring.sectionScores) ? scoring.sectionScores : [];
  const testResults = sectionScores.map((s) => ({
    sectionId: s.sectionId ?? null,
    sectionName: s.sectionName || `Section ${s.sectionId}`,
    testName: s.sectionName || `Section ${s.sectionId}`,
    completedAt: new Date(),
    score: Number(s.obtainedMarks) || 0,
    maxScore: Number(s.totalMarks) || 0,
    percentage: Number(s.percentage) || 0,
    dimensionScores: Array.isArray(s.dimensionScores) ? s.dimensionScores : [],
    reportUrl: "",
  }));

  return {
    overallScore,
    overallPercentile: `Top ${Math.max(1, 100 - overallScore)}% nationally`,
    completedTestsCount: sectionScores.length,
    totalTestsCount: sectionScores.length,
    careerPathwaysCount: 10,
    testResults,
    strengths: [],
    careerRecommendations: [],
    personalityType: {
      code: "SCORING",
      title: scoring.packageName || "PDF Scored Package",
      description: `Scored from answer key (${obtainedMarks}/${totalMarks})`,
      traits: [],
    },
  };
}

// POST /api/v1/user/test-submit - submit livetest and update result profile (protected)
export const postTestSubmit = async (req, res) => {
  try {
    const { answers, scoring } = req.body;
    const profile = computeResultFromScoring(scoring) || computeResultFromAnswers(answers);
    if (!profile) return res.status(400).json({ success: false, msg: "No answers to submit" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    user.resultProfile = profile;
    user.testsCompleted = (user.testsCompleted || 0) + 1;
    user.testsInProgress = Math.max(0, (user.testsInProgress || 0) - 1);
    user.reportsReady = (user.reportsReady || 0) + 1;
    user.submissionApprovalStatus = "pending";
    user.submissionApprovedAt = null;
    user.testProgress = { sectionId: 1, questionIndex: 0, answers: {}, timeRemainingSeconds: null, updatedAt: null };
    pushActivity(user, {
      action: "Test submitted",
      status: "Submitted",
      type: "test",
    });
    pushActivity(user, {
      action: "Result generated",
      status: "Completed",
      type: "result",
    });
    await user.save();

    return res.status(200).json({
      success: true,
      data: { resultProfile: user.resultProfile },
    });
  } catch (err) {
    console.error("Test submit error:", err);
    res.status(500).json({ success: false, msg: err.message || "Failed to submit test" });
  }
};

// POST /api/v1/user/payment-complete - save payment event for admin pages (protected)
export const postPaymentComplete = async (req, res) => {
  try {
    const { orderId, packageName, amount, method } = req.body;
    if (!orderId || !packageName || amount == null) {
      return res.status(400).json({ success: false, msg: "orderId, packageName and amount are required" });
    }

    const cleanMethod = ["Card", "UPI", "Net Banking", "Wallet"].includes(method) ? method : "UPI";
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    user.payments = user.payments || [];
    user.payments.push({
      orderId,
      packageName,
      amount: Number(amount),
      method: cleanMethod,
      status: "Completed",
      createdAt: new Date(),
    });

    const lower = String(packageName).toLowerCase();
    if (lower.includes("premium")) user.subscription = "Premium";
    else if (lower.includes("standard")) user.subscription = "Standard";
    else user.subscription = "Basic";

    pushActivity(user, {
      action: "Payment received",
      status: "Completed",
      type: "payment",
    });
    await user.save();

    return res.status(200).json({ success: true, data: { ok: true } });
  } catch (err) {
    console.error("Payment complete error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to save payment" });
  }
};
