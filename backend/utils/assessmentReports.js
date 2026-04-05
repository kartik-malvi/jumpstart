import {
  RESULT_PUBLICATION_STATUS,
  getProfilePublicationState,
  getResultPublicationState,
} from "./resultApproval.js";

const cloneArray = (items = [], mapItem) =>
  Array.isArray(items) ? items.map((item) => mapItem(item || {})) : [];

const cloneFactorResult = (item = {}) => ({
  id: item.id || "",
  key: item.key || "",
  label: item.label || "",
  score: item.score == null ? null : Number(item.score),
  rawScore: item.rawScore == null ? null : Number(item.rawScore),
  maxScore: item.maxScore == null ? null : Number(item.maxScore),
  average: item.average == null ? null : Number(item.average),
  percentage: item.percentage == null ? null : Number(item.percentage),
  band: item.band || "",
  status: item.status || "",
  description: item.description || "",
  interpretation: item.interpretation || "",
  careerImplication: item.careerImplication || "",
  answerType: item.answerType || "",
  scoreType: item.scoreType || "",
  questionNumbers: Array.isArray(item.questionNumbers)
    ? item.questionNumbers.map((value) => Number(value)).filter(Number.isFinite)
    : [],
  questionRangeLabel: item.questionRangeLabel || "",
});

const cloneSubsection = (subsection = {}) => ({
  id: subsection.id || "",
  key: subsection.key || "",
  label: subsection.label || "",
  score: subsection.score == null ? null : Number(subsection.score),
  rawScore: subsection.rawScore == null ? null : Number(subsection.rawScore),
  maxScore: subsection.maxScore == null ? null : Number(subsection.maxScore),
  average: subsection.average == null ? null : Number(subsection.average),
  percentage:
    subsection.percentage == null ? null : Number(subsection.percentage),
  band: subsection.band || "",
  status: subsection.status || "",
  description: subsection.description || "",
  interpretation: subsection.interpretation || "",
  careerImplication: subsection.careerImplication || "",
  answerType: subsection.answerType || "",
  scoreType: subsection.scoreType || "",
  questionNumbers: Array.isArray(subsection.questionNumbers)
    ? subsection.questionNumbers.map((value) => Number(value)).filter(Number.isFinite)
    : [],
  questionRangeLabel: subsection.questionRangeLabel || "",
  factorResults: cloneArray(subsection.factorResults, cloneFactorResult),
});

export const createEmptyResultProfile = () => ({
  overallScore: null,
  overallPercentile: "",
  completedTestsCount: 0,
  totalTestsCount: 0,
  careerPathwaysCount: 0,
  testResults: [],
  sectionBreakdown: [],
  strengths: [],
  careerRecommendations: [],
  personalityType: {
    code: "",
    title: "",
    description: "",
    traits: [],
  },
  reviewSummary: {
    statusLabel: "",
    strongestSignals: [],
    topCareerTitles: [],
    observations: [],
  },
  metadata: {
    algorithmKey: "",
    overallMaxScore: null,
    packageId: "",
    scoringGuideSources: [],
    ambiguityNotes: [],
  },
});

export const createEmptyResultPublication = () => ({
  status: RESULT_PUBLICATION_STATUS.NOT_SUBMITTED,
  submittedAt: null,
  approvedAt: null,
  approvedByName: "",
});

export const cloneResultProfile = (profile = {}) => ({
  overallScore:
    profile?.overallScore == null ? null : Number(profile.overallScore),
  overallPercentile: String(profile?.overallPercentile || ""),
  completedTestsCount: Number(profile?.completedTestsCount || 0),
  totalTestsCount: Number(profile?.totalTestsCount || 0),
  careerPathwaysCount: Number(profile?.careerPathwaysCount || 0),
  testResults: cloneArray(profile?.testResults, (item) => ({
    testName: item.testName || "",
    sectionName: item.sectionName || "",
    sectionId: item.sectionId == null ? null : Number(item.sectionId),
    completedAt: item.completedAt || null,
    score: item.score == null ? null : Number(item.score),
    maxScore: item.maxScore == null ? null : Number(item.maxScore),
    reportUrl: item.reportUrl || "",
    interpretation: item.interpretation || "",
  })),
  sectionBreakdown: cloneArray(profile?.sectionBreakdown, (section) => ({
    sectionId: section.sectionId == null ? null : Number(section.sectionId),
    title: section.title || "",
    score: section.score == null ? null : Number(section.score),
    maxScore: section.maxScore == null ? null : Number(section.maxScore),
    average: section.average == null ? null : Number(section.average),
    percentage:
      section.percentage == null ? null : Number(section.percentage),
    answeredCount:
      section.answeredCount == null ? null : Number(section.answeredCount),
    totalQuestions:
      section.totalQuestions == null ? null : Number(section.totalQuestions),
    status: section.status || "",
    interpretation: section.interpretation || "",
    careerImplication: section.careerImplication || "",
    scoringType: section.scoringType || "",
    answerType: section.answerType || "",
    scoreType: section.scoreType || "",
    questionNumbers: Array.isArray(section.questionNumbers)
      ? section.questionNumbers.map((item) => Number(item)).filter(Number.isFinite)
      : [],
    questionRangeLabel: section.questionRangeLabel || "",
    subsections: cloneArray(section.subsections, cloneSubsection),
  })),
  strengths: cloneArray(profile?.strengths, (item) => ({
    name: item.name || "",
    value: item.value == null ? null : Number(item.value),
    desc: item.desc || "",
  })),
  careerRecommendations: cloneArray(profile?.careerRecommendations, (career) => ({
    title: career.title || "",
    matchPercent:
      career.matchPercent == null ? null : Number(career.matchPercent),
    description: career.description || "",
    skills: Array.isArray(career.skills) ? career.skills : [],
    salaryRange: career.salaryRange || "",
    link: career.link || "",
  })),
  personalityType: {
    code: profile?.personalityType?.code || "",
    title: profile?.personalityType?.title || "",
    description: profile?.personalityType?.description || "",
    traits: cloneArray(profile?.personalityType?.traits, (trait) => ({
      name: trait.name || "",
      value: trait.value == null ? null : Number(trait.value),
    })),
  },
  reviewSummary: {
    statusLabel: profile?.reviewSummary?.statusLabel || "",
    strongestSignals: Array.isArray(profile?.reviewSummary?.strongestSignals)
      ? profile.reviewSummary.strongestSignals
      : [],
    topCareerTitles: Array.isArray(profile?.reviewSummary?.topCareerTitles)
      ? profile.reviewSummary.topCareerTitles
      : [],
    observations: Array.isArray(profile?.reviewSummary?.observations)
      ? profile.reviewSummary.observations
      : [],
  },
  metadata: {
    algorithmKey: profile?.metadata?.algorithmKey || "",
    overallMaxScore:
      profile?.metadata?.overallMaxScore == null
        ? null
        : Number(profile.metadata.overallMaxScore),
    packageId: profile?.metadata?.packageId || "",
    scoringGuideSources: Array.isArray(profile?.metadata?.scoringGuideSources)
      ? profile.metadata.scoringGuideSources
      : [],
    ambiguityNotes: Array.isArray(profile?.metadata?.ambiguityNotes)
      ? profile.metadata.ambiguityNotes
      : [],
  },
});

export const cloneResultPublication = (publication = {}) => ({
  status: publication?.status || RESULT_PUBLICATION_STATUS.NOT_SUBMITTED,
  submittedAt: publication?.submittedAt || null,
  approvedAt: publication?.approvedAt || null,
  approvedByName: publication?.approvedByName || "",
});

const toPackageLookupMap = (packageLookup) => {
  if (packageLookup instanceof Map) return packageLookup;
  return new Map(Array.isArray(packageLookup) ? packageLookup : []);
};

const resolvePackageTitle = (packageLookup, packageId, fallbackTitle = "") => {
  const lookup = toPackageLookupMap(packageLookup);
  return (
    fallbackTitle ||
    lookup.get(String(packageId || ""))?.title ||
    String(packageId || "") ||
    "Assessment"
  );
};

export const buildLegacyAssessmentReport = (user = {}, packageLookup) => {
  const publication = getResultPublicationState(user);
  if (!publication.hasProfileData) return null;

  return {
    _id: String(user?._id || ""),
    packageId: String(user?.selectedPackageId || ""),
    packageTitle: resolvePackageTitle(
      packageLookup,
      user?.selectedPackageId,
      user?.selectedPackageId
    ),
    attemptNumber: Math.max(1, Number(user?.testsCompleted || 1)),
    profile: cloneResultProfile(user?.resultProfile || {}),
    publication: cloneResultPublication(publication),
    createdAt:
      publication.submittedAt || user?.updatedAt || user?.createdAt || null,
    updatedAt: user?.updatedAt || publication.approvedAt || null,
    isLegacyFallback: true,
  };
};

export const normalizeAssessmentReport = (report = {}, packageLookup) => {
  const profile = cloneResultProfile(
    report?.profile || report?.resultProfile || {}
  );
  const publication = cloneResultPublication(
    report?.publication || report?.resultPublication || {}
  );
  const state = getProfilePublicationState(profile, publication, report);

  return {
    _id: String(report?._id || ""),
    packageId: String(report?.packageId || ""),
    packageTitle: resolvePackageTitle(
      packageLookup,
      report?.packageId,
      report?.packageTitle
    ),
    attemptNumber: Math.max(1, Number(report?.attemptNumber || 1)),
    profile,
    publication: {
      ...publication,
      status: state.status,
      submittedAt: state.submittedAt,
      approvedAt: state.approvedAt,
      approvedByName: state.approvedByName,
    },
    createdAt: report?.createdAt || state.submittedAt || null,
    updatedAt: report?.updatedAt || state.approvedAt || state.submittedAt || null,
    isLegacyFallback: report?.isLegacyFallback === true,
  };
};

const getReportTimestamp = (report = {}) => {
  const value =
    report?.publication?.submittedAt ||
    report?.publication?.approvedAt ||
    report?.updatedAt ||
    report?.createdAt ||
    null;
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const getStoredAssessmentReports = (user = {}, packageLookup) => {
  const reports = Array.isArray(user?.assessmentReports) ? user.assessmentReports : [];
  if (reports.length) {
    return reports
      .map((report) => normalizeAssessmentReport(report, packageLookup))
      .sort((a, b) => getReportTimestamp(b) - getReportTimestamp(a));
  }

  const legacyReport = buildLegacyAssessmentReport(user, packageLookup);
  return legacyReport ? [legacyReport] : [];
};

export const getLatestAssessmentReport = (user = {}, packageLookup) =>
  getStoredAssessmentReports(user, packageLookup)[0] || null;

export const getLatestApprovedAssessmentReport = (user = {}, packageLookup) =>
  getStoredAssessmentReports(user, packageLookup).find(
    (report) =>
      report.publication.status === RESULT_PUBLICATION_STATUS.APPROVED
  ) || null;

export const createAssessmentReportEntry = ({
  user = {},
  packageId = "",
  packageTitle = "",
  profile = {},
  publication = {},
}) => {
  const previousAttempts = getStoredAssessmentReports(user).filter(
    (report) => String(report.packageId || "") === String(packageId || "")
  ).length;
  const now = publication?.submittedAt || new Date();

  return {
    packageId: String(packageId || ""),
    packageTitle: String(packageTitle || packageId || "Assessment"),
    attemptNumber: previousAttempts + 1,
    profile: cloneResultProfile(profile),
    publication: cloneResultPublication(publication),
    createdAt: now,
    updatedAt: now,
  };
};

export const resetLegacyResultState = (user) => {
  user.resultProfile = createEmptyResultProfile();
  user.resultPublication = createEmptyResultPublication();
  user.topCareers = [];
  user.reportsReady = 0;
};

export const syncLegacyStateFromReports = (user, packageLookup) => {
  const reports = getStoredAssessmentReports(user, packageLookup);
  const latestReport = reports[0] || null;
  const approvedReports = reports.filter(
    (report) =>
      report.publication.status === RESULT_PUBLICATION_STATUS.APPROVED
  );
  const latestApprovedReport = approvedReports[0] || null;

  if (latestReport) {
    user.resultProfile = cloneResultProfile(latestReport.profile);
    user.resultPublication = cloneResultPublication(latestReport.publication);
  } else {
    user.resultProfile = createEmptyResultProfile();
    user.resultPublication = createEmptyResultPublication();
  }

  user.reportsReady = approvedReports.length;
  user.topCareers = latestApprovedReport
    ? latestApprovedReport.profile.careerRecommendations
        .slice(0, 3)
        .map((career) => ({
          title: career.title,
          matchPercent: career.matchPercent,
        }))
    : [];

  return {
    latestReport,
    latestApprovedReport,
    approvedReports,
  };
};
