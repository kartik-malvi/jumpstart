import { LIVETEST_QUESTIONS, SECTIONS } from "../data/livetestQuestions";

const SELECTED_SECTIONS_KEY = "selected_test_sections";
const COMPLETED_SECTIONS_KEY = "completed_test_sections";
const SELECTED_PACKAGE_KEY = "selected_test_package";
const SELECTED_PACKAGE_SNAPSHOT_KEY = "selected_test_package_snapshot";
const defaultSections = SECTIONS.map((section, idx) => ({
  id: section.id,
  name: section.title,
  durationMinutes: section.durationMinutes,
  questions: (LIVETEST_QUESTIONS[idx] || []).map((q, qIdx) => ({
    id: `${section.id}-${qIdx + 1}`,
    text: q,
    correctOption: null,
    marks: 1,
  })),
}));

const DEFAULT_PACKAGE = {
  id: 1,
  name: "Default PDF Question Package",
  features: "PDF question set + answer key scoring via Google Sheets",
  price: "₹999",
  oldPrice: "",
  status: "Active",
  questionPdf: "complete-aptitude-test-500q.pdf",
  answerKeyPdf: "complete-answer-key-500q.pdf",
  sections: defaultSections,
};

const canUseStorage = () => typeof window !== "undefined" && !!window.localStorage;

export const getSelectedSectionIds = (activePackage) => {
  const fallbackIds = (activePackage?.sections || []).map((s) => s.id);
  if (!canUseStorage()) return fallbackIds;

  try {
    const raw = localStorage.getItem(SELECTED_SECTIONS_KEY);
    if (!raw) return fallbackIds;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallbackIds;
    const valid = parsed.filter((id) => fallbackIds.includes(id));
    return valid.length > 0 ? valid : fallbackIds;
  } catch {
    return fallbackIds;
  }
};
export const saveSelectedSectionIds = (ids) => {
  if (!canUseStorage()) return;
  localStorage.setItem(SELECTED_SECTIONS_KEY, JSON.stringify(ids));
};

export const getCompletedSectionIds = () => {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(COMPLETED_SECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCompletedSectionIds = (ids) => {
  if (!canUseStorage()) return;
  localStorage.setItem(COMPLETED_SECTIONS_KEY, JSON.stringify(ids));
};

export const clearCompletedSectionIds = () => {
  if (!canUseStorage()) return;
  localStorage.removeItem(COMPLETED_SECTIONS_KEY);
};

export const getSelectedPackageId = () => {
  if (!canUseStorage()) return null;
  return localStorage.getItem(SELECTED_PACKAGE_KEY);
};

export const saveSelectedPackageId = (id) => {
  if (!canUseStorage() || !id) return;
  localStorage.setItem(SELECTED_PACKAGE_KEY, String(id));
};

export const getSelectedPackageSnapshot = () => {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(SELECTED_PACKAGE_SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveSelectedPackageSnapshot = (pkg) => {
  if (!canUseStorage() || !pkg || typeof pkg !== "object") return;

  const normalized = {
    ...pkg,
    id: pkg._id || pkg.id,
    sections: Array.isArray(pkg.sections) ? pkg.sections : [],
  };

  localStorage.setItem(SELECTED_PACKAGE_SNAPSHOT_KEY, JSON.stringify(normalized));
};

export const getSelectedSections = (activePackage) => {
  const selectedIds = getSelectedSectionIds(activePackage);
  const sectionMap = new Map((activePackage?.sections || []).map((s) => [s.id, s]));
  return selectedIds.map((id) => sectionMap.get(id)).filter(Boolean);
};

export const getPackageSheetTemplateCsv = () => [
  "packageName,priceLabel,features,description,status,section,subsection,durationMinutes,question,questionType,dimension,reverseScored,correctOption,marks",
  'Career Discovery Basic,₹999,"2 sections, 4 questions","Single-sheet package import sample",Draft,Section 1,Self Awareness,20,"I am someone who is talkative and outgoing",likert5,Extraversion,false,,1',
  'Career Discovery Basic,₹999,"2 sections, 4 questions","Single-sheet package import sample",Draft,Section 1,Self Awareness,20,"I see myself as someone who is reserved and quiet",likert5,Extraversion,true,,1',
  'Career Discovery Basic,₹999,"2 sections, 4 questions","Single-sheet package import sample",Draft,Section 2,Career Aptitude,25,"I find it easy to start conversations with new people",hspq_abc,Warmth,false,,1',
  'Career Discovery Basic,₹999,"2 sections, 4 questions","Single-sheet package import sample",Draft,Section 2,Career Aptitude,25,"Sample objective question",objective,Logical Reasoning,false,2,2',
].join("\n");

export const getQuestionsTemplateCsv = getPackageSheetTemplateCsv;

export const getAnswerKeyTemplateCsv = () => [
  "section,question,questionType,correctOption,marks",
  'Section 1,"Sample objective question",objective,2,1',
  'Section 1,"Another objective question",objective,4,2',
].join("\n");

export const getMailListTemplateCsv = () => [
  "name,email",
  "John Doe,john@example.com",
  "Priya Patel,priya@example.com",
].join("\n");

export const getTemplateCsv = getQuestionsTemplateCsv;

const DEFAULT_COUPONS = [
  { id: 1, code: "LAUNCH50", discount: "50%", validUntil: "Dec 31, 2027", used: "0 / 500" },
];

export const getDefaultCoupons = () => DEFAULT_COUPONS;

export default DEFAULT_PACKAGE;
