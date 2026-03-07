import User from "../models/User.js";
import AssessmentConfig from "../models/AssessmentConfig.js";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const toSectionCard = (s) => ({
  title: s.title,
  durationMinutes: s.durationMinutes ?? 20,
  totalQuestions: Array.isArray(s.questions) ? s.questions.length : 0,
  status: "not_started",
});

const getActivePackages = (cfg) => (cfg.packages || []).filter((p) => p.active !== false).sort((a, b) => a.sortOrder - b.sortOrder);

const getSelectedPackage = (cfg, user) => {
  const active = getActivePackages(cfg);
  if (!active.length) return null;
  const selected = active.find((p) => p.id === user?.selectedPackageId);
  return selected || active[0];
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const computeResultFromAnswers = (answers, sections) => {
  if (!answers || typeof answers !== "object") return null;
  const enabledSections = (sections || []).filter((s) => s.enabled !== false);
  if (!enabledSections.length) return null;

  const testResults = [];
  let totalEarned = 0;
  let totalPossible = 0;

  for (const section of enabledSections) {
    const questions = Array.isArray(section.questions) ? section.questions : [];
    if (!questions.length) continue;

    let sectionEarned = 0;
    let sectionPossible = 0;
    questions.forEach((q, index) => {
      const rawAnswer = answers[`${section.sectionId}-${index}`];
      const weight = Number(q.weight || 1);

      if (q.type === "single") {
        sectionPossible += weight;
        if (rawAnswer !== undefined && String(rawAnswer).trim() === String(q.correctOption || "").trim()) {
          sectionEarned += weight;
        }
      } else {
        const numeric = Number(rawAnswer);
        if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 5) {
          sectionEarned += (q.reverseScored ? 6 - numeric : numeric) * weight;
        }
        sectionPossible += 5 * weight;
      }
    });

    if (sectionPossible > 0) {
      const sectionScore = Math.round((sectionEarned / sectionPossible) * 100);
      const avgOutOf5 = Number(((sectionEarned / sectionPossible) * 5).toFixed(2));
      const interpretation =
        section.scoringType === "objective"
          ? sectionScore >= 80
            ? "High aptitude range (PDF-aligned 80%+ band)"
            : sectionScore >= 60
              ? "Moderate aptitude range (PDF-aligned 60-79% band)"
              : "Needs improvement (PDF-aligned below 60% band)"
          : avgOutOf5 >= 4
            ? "High profile range (PDF-aligned 4.0-5.0 band)"
            : avgOutOf5 >= 3
              ? "Moderate profile range (PDF-aligned 3.0-3.9 band)"
              : "Developing profile range (PDF-aligned below 3.0 band)";

      totalEarned += sectionEarned;
      totalPossible += sectionPossible;
      testResults.push({
        sectionId: section.sectionId,
        sectionName: section.title,
        testName: section.title,
        completedAt: new Date(),
        score: sectionScore,
        maxScore: 100,
        avgOutOf5,
        interpretation,
        reportUrl: "",
      });
    }
  }

  if (!testResults.length || totalPossible <= 0) return null;
  const overallScore = Math.round((totalEarned / totalPossible) * 100);
  const sorted = [...testResults].sort((a, b) => b.score - a.score);

  return {
    overallScore,
    overallPercentile: `Top ${Math.max(5, 100 - overallScore)}% nationally`,
    completedTestsCount: testResults.length,
    totalTestsCount: enabledSections.length,
    careerPathwaysCount: Math.max(10, testResults.length * 3),
    testResults,
    strengths: sorted.slice(0, 5).map((s) => ({ name: s.testName, value: s.score, desc: `Performance in ${s.testName}` })),
    careerRecommendations: sorted.slice(0, 3).map((s, idx) => ({
      title: idx === 0 ? "Primary Career Fit" : idx === 1 ? "Secondary Career Fit" : "Emerging Career Fit",
      matchPercent: s.score,
      description: `Based on your strongest section: ${s.testName}`,
      skills: ["Communication", "Problem Solving", "Adaptability"],
      salaryRange: "",
    })),
    personalityType: null,
  };
};

// PATCH /api/v1/user/package/select
export const selectPackage = async (req, res) => {
  try {
    const { packageId } = req.body || {};
    if (!packageId) return res.status(400).json({ success: false, msg: "packageId is required" });
    const [cfg, user] = await Promise.all([AssessmentConfig.getOrCreateDefault(), User.findById(req.user.id)]);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    const pkg = getActivePackages(cfg).find((p) => p.id === packageId);
    if (!pkg) return res.status(404).json({ success: false, msg: "Package not found or inactive" });

    user.selectedPackageId = pkg.id;
    user.purchasedPackages = [...new Set([...(user.purchasedPackages || []), pkg.id])];
    user.testProgress = {
      sectionId: 1,
      questionIndex: 0,
      answers: {},
      completedSectionIds: [],
      timeRemainingSeconds: null,
      updatedAt: null,
    };
    await user.save();
    return res.status(200).json({ success: true, data: { packageId: pkg.id } });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Failed to select package" });
  }
};

// GET /api/v1/user/package/current
export const getCurrentPackage = async (req, res) => {
  try {
    const [cfg, user] = await Promise.all([AssessmentConfig.getOrCreateDefault(), User.findById(req.user.id).lean()]);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    const pkg = getSelectedPackage(cfg, user);
    if (!pkg) return res.status(404).json({ success: false, msg: "No active package found" });
    const sections = (pkg.sections || []).filter((s) => s.enabled !== false).sort((a, b) => a.sectionId - b.sectionId);
    return res.status(200).json({
      success: true,
      data: {
        package: { id: pkg.id, title: pkg.title, amount: pkg.amount },
        sections: sections.map((s) => ({
          sectionId: s.sectionId,
          title: s.title,
          durationMinutes: s.durationMinutes,
          scoringType: s.scoringType,
          totalQuestions: (s.questions || []).length,
        })),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Failed to load current package" });
  }
};

// GET /api/v1/user/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("name email mobile subscription role selectedPackageId createdAt")
      .lean();
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Failed to load profile" });
  }
};

// PATCH /api/v1/user/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, mobile, currentPassword, newPassword } = req.body || {};
    const hasProfileUpdate =
      name !== undefined || email !== undefined || mobile !== undefined || newPassword !== undefined;
    if (!hasProfileUpdate) {
      return res.status(400).json({ success: false, msg: "No valid fields to update" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) return res.status(400).json({ success: false, msg: "Name is required" });
      if (trimmed.length > 80) return res.status(400).json({ success: false, msg: "Name is too long" });
      user.name = trimmed;
    }

    if (email !== undefined) {
      const normalized = String(email).trim().toLowerCase();
      if (!emailRegex.test(normalized)) {
        return res.status(400).json({ success: false, msg: "Valid email is required" });
      }
      if (normalized !== user.email) {
        const existing = await User.findOne({ email: normalized, _id: { $ne: user._id } }).select("_id").lean();
        if (existing) return res.status(409).json({ success: false, msg: "Email is already in use" });
        user.email = normalized;
      }
    }

    if (mobile !== undefined) {
      user.mobile = String(mobile || "").trim();
    }

    if (newPassword !== undefined) {
      const normalizedNewPassword = String(newPassword);
      if (normalizedNewPassword.length < 6) {
        return res.status(400).json({ success: false, msg: "New password must be at least 6 characters" });
      }
      if (user.password) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, msg: "Current password is required" });
        }
        const ok = await user.comparePassword(String(currentPassword));
        if (!ok) return res.status(400).json({ success: false, msg: "Current password is incorrect" });
      }
      user.password = normalizedNewPassword;
    }

    await user.save();
    return res.status(200).json({
      success: true,
      data: {
        user: user.toAuthJSON(),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Failed to update profile" });
  }
};

// GET /api/v1/user/init
export const init = async (req, res) => {
  try {
    const [user, cfg] = await Promise.all([
      User.findById(req.user.id).select("name email testsCompleted testsInProgress reportsReady counsellingSessions topCareers resultProfile selectedPackageId").lean(),
      AssessmentConfig.getOrCreateDefault(),
    ]);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    const pkg = getSelectedPackage(cfg, user);
    const sections = pkg ? (pkg.sections || []).filter((s) => s.enabled !== false).sort((a, b) => a.sectionId - b.sectionId) : [];

    const profile = user.resultProfile || {};
    const topCareers =
      Array.isArray(profile.careerRecommendations) && profile.careerRecommendations.length > 0
        ? profile.careerRecommendations.map((c) => ({ title: c.title, matchPercent: c.matchPercent }))
        : Array.isArray(user.topCareers)
          ? user.topCareers
          : [];

    return res.status(200).json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, selectedPackageId: pkg?.id || "" },
        tests_completed: user.testsCompleted ?? 0,
        tests_in_progress: user.testsInProgress ?? 0,
        reports_ready: profile.testResults?.length ?? user.reportsReady ?? user.testsCompleted ?? 0,
        counselling_sessions: user.counsellingSessions ?? 0,
        available_tests: sections.map(toSectionCard),
        top_careers: topCareers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message || "Failed to load dashboard" });
  }
};

// GET /api/v1/user/results
export const getResults = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("resultProfile testsCompleted").lean();
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    const profile = user.resultProfile || {};
    const hasAnyResults =
      (profile.testResults && profile.testResults.length > 0) ||
      (profile.strengths && profile.strengths.length > 0) ||
      (profile.careerRecommendations && profile.careerRecommendations.length > 0) ||
      (profile.personalityType && profile.personalityType.code);
    return res.status(200).json({
      success: true,
      data: {
        hasResults: !!hasAnyResults,
        overallScore: profile.overallScore ?? null,
        overallPercentile: profile.overallPercentile || "",
        completedTestsCount: profile.completedTestsCount ?? user.testsCompleted ?? 0,
        totalTestsCount: profile.totalTestsCount ?? 0,
        careerPathwaysCount: profile.careerPathwaysCount ?? 0,
        testResults: Array.isArray(profile.testResults) ? profile.testResults : [],
        strengths: Array.isArray(profile.strengths) ? profile.strengths : [],
        careerRecommendations: Array.isArray(profile.careerRecommendations) ? profile.careerRecommendations : [],
        personalityType: profile.personalityType || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message || "Failed to load results" });
  }
};

// PATCH /api/v1/user/results
export const updateResults = async (req, res) => {
  try {
    const allowed = ["overallScore", "overallPercentile", "completedTestsCount", "totalTestsCount", "careerPathwaysCount", "testResults", "strengths", "careerRecommendations", "personalityType"];
    const updates = {};
    for (const key of allowed) if (req.body[key] !== undefined) updates[`resultProfile.${key}`] = req.body[key];
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, msg: "No valid fields to update" });
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select("resultProfile");
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    return res.status(200).json({ success: true, data: { resultProfile: user.resultProfile } });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message || "Failed to update results" });
  }
};

// GET /api/v1/user/test-progress
export const getTestProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("testProgress selectedPackageId").lean();
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    const p = user.testProgress || {};
    return res.status(200).json({
      success: true,
      data: {
        packageId: user.selectedPackageId || "",
        sectionId: p.sectionId ?? 1,
        questionIndex: p.questionIndex ?? 0,
        answers: p.answers || {},
        completedSectionIds: Array.isArray(p.completedSectionIds) ? p.completedSectionIds : [],
        timeRemainingSeconds: p.timeRemainingSeconds,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message || "Failed to load progress" });
  }
};

// PATCH /api/v1/user/test-progress
export const patchTestProgress = async (req, res) => {
  try {
    const { sectionId, questionIndex, answers, completedSectionIds, timeRemainingSeconds } = req.body;
    const update = { "testProgress.updatedAt": new Date() };
    if (sectionId !== undefined) update["testProgress.sectionId"] = sectionId;
    if (questionIndex !== undefined) update["testProgress.questionIndex"] = questionIndex;
    if (answers !== undefined) update["testProgress.answers"] = answers;
    if (Array.isArray(completedSectionIds)) {
      update["testProgress.completedSectionIds"] = [...new Set(completedSectionIds.map((n) => Number(n)).filter(Boolean))];
    }
    if (timeRemainingSeconds !== undefined) update["testProgress.timeRemainingSeconds"] = timeRemainingSeconds;
    await User.findByIdAndUpdate(req.user.id, { $set: update });
    return res.status(200).json({ success: true, data: { ok: true } });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message || "Failed to save progress" });
  }
};

// POST /api/v1/user/test-submit
export const postTestSubmit = async (req, res) => {
  try {
    const [cfg, user] = await Promise.all([AssessmentConfig.getOrCreateDefault(), User.findById(req.user.id)]);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    const pkg = getSelectedPackage(cfg, user);
    if (!pkg) return res.status(400).json({ success: false, msg: "No active package selected" });
    const sections = (pkg.sections || []).filter((s) => s.enabled !== false);
    const answers = req.body?.answers && typeof req.body.answers === "object" ? req.body.answers : (user.testProgress?.answers || {});
    const profile = computeResultFromAnswers(answers, sections);
    if (!profile) return res.status(400).json({ success: false, msg: "No valid answers to submit" });

    user.resultProfile = profile;
    user.testsCompleted = clamp((user.testsCompleted || 0) + 1, 0, 9999);
    user.testsInProgress = Math.max(0, (user.testsInProgress || 0) - 1);
    user.reportsReady = profile.testResults?.length || user.reportsReady || 0;
    user.testProgress = { sectionId: 1, questionIndex: 0, answers: {}, completedSectionIds: [], timeRemainingSeconds: null, updatedAt: null };
    await user.save();
    return res.status(200).json({ success: true, data: { resultProfile: user.resultProfile } });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message || "Failed to submit test" });
  }
};
