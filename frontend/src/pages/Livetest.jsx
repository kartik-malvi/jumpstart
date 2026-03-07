import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

const LIKERT_OPTIONS = [
  { label: "Strongly Disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly Agree", value: 5 },
];

const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function Livetest() {
  const { sectionId: sectionIdParam } = useParams();
  const navigate = useNavigate();
  const sectionId = Number(sectionIdParam || 1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState({
    sectionId,
    questionIndex: 0,
    answers: {},
    completedSectionIds: [],
    timeRemainingSeconds: null,
  });
  const [section, setSection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  const answerKey = (qIdx) => `${sectionId}-${qIdx}`;

  const currentQIdx = Math.max(0, progress.questionIndex || 0);
  const currentQuestion = questions[currentQIdx];
  const currentAnswer = progress.answers?.[answerKey(currentQIdx)];
  const totalQuestions = questions.length;
  const overallQuestions = allSections.reduce((sum, s) => sum + (s.totalQuestions || 0), 0) || totalQuestions;
  const previousQuestions = useMemo(
    () =>
      allSections
        .filter((s) => Number(s.sectionId) < sectionId)
        .reduce((sum, s) => sum + (s.totalQuestions || 0), 0),
    [allSections, sectionId]
  );
  const globalQuestionNumber = previousQuestions + currentQIdx + 1;
  const progressPercent = Math.round((globalQuestionNumber / Math.max(1, overallQuestions)) * 100);

  useEffect(() => {
    Promise.all([api.get("/v1/user/package/current"), api.get("/v1/user/test-progress")])
      .then(([pkgRes, progressRes]) => {
        const packageId = pkgRes?.data?.data?.package?.id;
        if (!packageId) throw new Error("No selected package");
        return Promise.all([
          Promise.resolve(pkgRes),
          api.get(`/v1/public/packages/${packageId}/sections/${sectionId}/questions`),
          Promise.resolve(progressRes),
        ]);
      })
      .then(([pkgRes, sectionRes, progressRes]) => {
        const sections = pkgRes?.data?.data?.sections || [];
        setAllSections(sections);

        const s = sectionRes?.data?.data?.section;
        const q = sectionRes?.data?.data?.questions || [];
        setSection(s);
        setQuestions(q);

        const p = progressRes?.data?.data || {};
        const restoredIndex = p.sectionId === sectionId ? Number(p.questionIndex || 0) : 0;
        const restoredTime =
          p.sectionId === sectionId && Number.isFinite(Number(p.timeRemainingSeconds))
            ? Number(p.timeRemainingSeconds)
            : (s?.durationMinutes || 20) * 60;
        const initialTime = restoredTime > 0 ? restoredTime : (s?.durationMinutes || 20) * 60;

        setProgress({
          sectionId,
          questionIndex: Math.min(restoredIndex, Math.max(0, q.length - 1)),
          answers: p.answers || {},
          completedSectionIds: p.completedSectionIds || [],
          timeRemainingSeconds: initialTime,
        });
        setTimeLeft(Number(initialTime) || 0);
      })
      .catch((err) => {
        console.error("Failed to load section", err);
        navigate("/pretest", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [sectionId, navigate]);

  const completeSection = useCallback(
    (remainingSeconds = 0) => {
      if (saving) return;
      const completedSectionIds = [...new Set([...(progress.completedSectionIds || []), sectionId])];
      const next = { ...progress, completedSectionIds };
      setProgress(next);
      setSaving(true);
      api
        .patch("/v1/user/test-progress", {
          sectionId,
          questionIndex: currentQIdx,
          answers: next.answers,
          completedSectionIds,
          timeRemainingSeconds: Math.max(0, Number(remainingSeconds) || 0),
        })
        .finally(() => {
          setSaving(false);
          navigate("/pretest", { replace: true });
        });
    },
    [sectionId, currentQIdx, progress, navigate, saving]
  );

  useEffect(() => {
    if (loading) return undefined;
    if (!Number.isFinite(Number(timeLeft))) return undefined;
    if (Number(timeLeft) <= 0) return undefined;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, Number(prev) - 1);
        if (next === 0) {
          clearInterval(timer);
          completeSection(0);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, sectionId, timeLeft, completeSection]);

  useEffect(() => {
    setProgress((prev) => ({ ...prev, timeRemainingSeconds: Number(timeLeft) || 0 }));
  }, [timeLeft]);

  const handleAnswer = (value) => {
    const answers = { ...(progress.answers || {}), [answerKey(currentQIdx)]: value };
    const next = { ...progress, answers };
    setProgress(next);
  };

  const goPrev = () => {
    if (currentQIdx <= 0) return;
    const questionIndex = currentQIdx - 1;
    const next = { ...progress, questionIndex };
    setProgress(next);
  };

  const goNext = () => {
    if (currentQIdx < totalQuestions - 1) {
      const questionIndex = currentQIdx + 1;
      const next = { ...progress, questionIndex };
      setProgress(next);
      return;
    }
    completeSection(timeLeft);
  };

  if (loading || !section) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[#65758B]">Loading section...</p>
      </div>
    );
  }

  const timerLabel = Number.isFinite(Number(timeLeft))
    ? formatTime(Number(timeLeft))
    : "--:--";

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 sm:px-6 md:px-8 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F1729]">
            Section {section.sectionId}: {section.title}
          </h1>
          <span className="text-lg font-semibold text-[#0F1729]">{timerLabel}</span>
        </div>

        <p className="text-sm text-[#65758B] mb-1">
          Question {globalQuestionNumber} of {Math.max(1, overallQuestions)}
        </p>
        <div className="h-2 bg-[#E1E7EF] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-[#188B8B] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-[#65758B] mb-6">{progressPercent}% Complete</p>

        <div className="bg-white rounded-2xl border border-[#E1E7EF] shadow-sm p-6 sm:p-8 mb-6">
          <p className="text-lg font-semibold text-[#0F1729] mb-6">
            {currentQuestion?.text || "No question found for this section."}
          </p>

          {currentQuestion?.type === "single" ? (
            <div className="space-y-3">
              {(currentQuestion.options || []).map((opt, idx) => {
                const value = String.fromCharCode(65 + idx);
                return (
                  <label
                    key={`${value}-${opt}`}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                      String(currentAnswer) === value
                        ? "border-[#188B8B] bg-[rgba(24,139,139,0.06)]"
                        : "border-[#E1E7EF] bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="objective"
                      checked={String(currentAnswer) === value}
                      onChange={() => handleAnswer(value)}
                      className="w-4 h-4 text-[#188B8B] border-gray-300 focus:ring-[#188B8B]"
                    />
                    <span className="text-sm font-medium text-[#0F1729]">{value}. {opt}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {LIKERT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                    Number(currentAnswer) === opt.value
                      ? "border-[#188B8B] bg-[rgba(24,139,139,0.06)]"
                      : "border-[#E1E7EF] bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="likert"
                    checked={Number(currentAnswer) === opt.value}
                    onChange={() => handleAnswer(opt.value)}
                    className="w-4 h-4 text-[#188B8B] border-gray-300 focus:ring-[#188B8B]"
                  />
                  <span className="text-sm font-medium text-[#0F1729]">{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentQIdx === 0}
              className="px-6 py-2.5 border-2 border-[#188B8B] text-[#188B8B] rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={saving}
              className="px-6 py-2.5 bg-[#F59F0A] text-[#0F1729] rounded-xl font-semibold hover:bg-amber-500 disabled:opacity-70"
            >
              {currentQIdx < totalQuestions - 1 ? "Next" : "Complete Section"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
