import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoPause } from "react-icons/io5";
import api from "../api/api";
import { LIKERT_OPTIONS } from "../data/livetestQuestions";
import {
  clearCompletedSectionIds,
  getCompletedSectionIds,
  getSelectedSections,
  saveCompletedSectionIds,
} from "../utils/testPackageStore";
import { usePackageData } from "../context/PackageContext";

const getQuestionMeta = (question) => {
  if (typeof question === "string") {
    return { text: question, questionType: "likert5", reverseScored: false, correctOption: null, marks: 1, dimension: "" };
  }
  return {
    text: question?.text || "",
    questionType: question?.questionType || "likert5",
    reverseScored: !!question?.reverseScored,
    correctOption: question?.correctOption ?? null,
    marks: Number(question?.marks) || 1,
    dimension: question?.dimension || "",
    subsection: question?.subsection || "",
  };
};

const getOptionsByType = (questionType) => {
  if (questionType === "hspq_abc") {
    return [
      { label: "A (True)", value: 1 },
      { label: "B (Sometimes)", value: 2 },
      { label: "C (False)", value: 3 },
    ];
  }
  if (questionType === "objective") {
    return [
      { label: "Option 1", value: 1 },
      { label: "Option 2", value: 2 },
      { label: "Option 3", value: 3 },
      { label: "Option 4", value: 4 },
      { label: "Option 5", value: 5 },
    ];
  }
  return LIKERT_OPTIONS;
};

const Livetest = () => {
  const { sectionId: sectionIdParam } = useParams();
  const navigate = useNavigate();

  const { activePackage } = usePackageData();
  const selectedSections = useMemo(() => getSelectedSections(activePackage), [activePackage]);
  const completedIds = useMemo(() => getCompletedSectionIds(), [sectionIdParam]);

  const sectionIds = selectedSections.map((s) => String(s.id));
  const defaultSectionId = selectedSections.find((s) => !completedIds.includes(s.id))?.id || selectedSections[0]?.id;

  const resolvedSectionId = sectionIds.includes(String(sectionIdParam)) ? String(sectionIdParam) : defaultSectionId;

  useEffect(() => {
    if (!resolvedSectionId) {
      navigate("/Pretest", { replace: true });
      return;
    }
    if (String(sectionIdParam) !== String(resolvedSectionId)) {
      navigate(`/livetest/${resolvedSectionId}`, { replace: true });
    }
  }, [sectionIdParam, resolvedSectionId, navigate]);

  const section = selectedSections.find((s) => String(s.id) === String(resolvedSectionId));
  const questions = section?.questions || [];
  const questionsInSection = questions.length;
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState((section?.durationMinutes || 20) * 60);
  const [loading, setLoading] = useState(true);
  const [pausing, setPausing] = useState(false);
  const [pauseError, setPauseError] = useState("");

  const totalQuestions = selectedSections.reduce((sum, s) => sum + (s.questions?.length || 0), 0);
  const completedQuestions = selectedSections
    .filter((s) => completedIds.includes(String(s.id)) && String(s.id) !== String(resolvedSectionId))
    .reduce((sum, s) => sum + (s.questions?.length || 0), 0);

  const key = (s, q) => `${s}-${q}`;

  useEffect(() => {
    if (!section) return;

    api
      .get("/v1/user/test-progress")
      .then((res) => {
        const d = res?.data?.data;
        if (d?.answers && typeof d.answers === "object") setAnswers(d.answers);

        if (String(d?.sectionId) === String(resolvedSectionId)) {
          if (typeof d?.questionIndex === "number" && d.questionIndex >= 0) {
            setCurrentQIdx(Math.min(d.questionIndex, Math.max(0, questionsInSection - 1)));
          }
          if (typeof d?.timeRemainingSeconds === "number" && d.timeRemainingSeconds >= 0) {
            setTimeRemaining(d.timeRemainingSeconds);
          } else {
            setTimeRemaining((section.durationMinutes || 20) * 60);
          }
        } else {
          setCurrentQIdx(0);
          setTimeRemaining((section.durationMinutes || 20) * 60);
        }
      })
      .catch(() => {
        setCurrentQIdx(0);
        setTimeRemaining((section.durationMinutes || 20) * 60);
      })
      .finally(() => setLoading(false));
  }, [resolvedSectionId, questionsInSection, section]);

  useEffect(() => {
    if (loading) return;
    const t = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [loading]);

  const handleOptionSelect = (questionIndex, value) => {
    setCurrentQIdx(questionIndex);
    setAnswers((prev) => ({ ...prev, [key(String(resolvedSectionId), questionIndex)]: value }));
  };

  const answeredInCurrentSection = questions.reduce((sum, _, idx) => (
    answers[key(String(resolvedSectionId), idx)] != null ? sum + 1 : sum
  ), 0);
  const answeredQuestions = completedQuestions + answeredInCurrentSection;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  const submitTest = () => {
    const sectionScores = selectedSections.map((s) => {
      const questionsList = s.questions || [];
      let obtained = 0;
      let total = 0;
      const dimensionMap = {};

      questionsList.forEach((q, idx) => {
        const qq = getQuestionMeta(q);
        const ans = answers[`${String(s.id)}-${idx}`];
        if (ans == null) return;

        let points = 0;
        let max = 0;

        if (qq.questionType === "objective") {
          max = qq.marks;
          points = qq.correctOption != null && Number(ans) === Number(qq.correctOption) ? qq.marks : 0;
        } else if (qq.questionType === "hspq_abc") {
          const base = Number(ans) === 1 ? 3 : Number(ans) === 2 ? 2 : 1;
          points = qq.reverseScored ? 4 - base : base;
          max = 3;
        } else {
          const base = Number(ans) || 0;
          points = qq.reverseScored ? 6 - base : base;
          max = 5;
        }

        obtained += points;
        total += max;

        const dimension = qq.dimension || s.name;
        if (!dimensionMap[dimension]) dimensionMap[dimension] = { points: 0, max: 0 };
        dimensionMap[dimension].points += points;
        dimensionMap[dimension].max += max;
      });

      const dimensionScores = Object.entries(dimensionMap).map(([name, d]) => ({
        name,
        score: d.max > 0 ? Number((d.points / d.max).toFixed(3)) : 0,
      }));

      return {
        sectionId: s.id,
        sectionName: s.name,
        obtainedMarks: obtained,
        totalMarks: total,
        percentage: total > 0 ? Math.round((obtained / total) * 100) : 0,
        dimensionScores,
      };
    });

    const obtainedMarks = sectionScores.reduce((sum, s) => sum + s.obtainedMarks, 0);
    const totalMarks = sectionScores.reduce((sum, s) => sum + s.totalMarks, 0);

    const dimensionTotals = {};
    sectionScores.forEach((sec) => {
      (sec.dimensionScores || []).forEach((d) => {
        if (!dimensionTotals[d.name]) dimensionTotals[d.name] = { sum: 0, count: 0 };
        dimensionTotals[d.name].sum += d.score;
        dimensionTotals[d.name].count += 1;
      });
    });

    const dimensionAverages = Object.entries(dimensionTotals).map(([name, v]) => ({
      name,
      average: v.count > 0 ? Number((v.sum / v.count).toFixed(3)) : 0,
    }));

    api
      .post("/v1/user/test-submit", {
        sectionId: String(resolvedSectionId),
        answers,
        timeRemainingSeconds: timeRemaining,
        scoring: {
          obtainedMarks,
          totalMarks,
          percentage: totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0,
          sectionScores,
          dimensionAverages,
          packageName: activePackage?.name || "Package",
        },
      })
      .then(() => {
        clearCompletedSectionIds();
        navigate("/test-completed", { replace: true });
      });
  };

  const handlePauseTest = async () => {
    setPauseError("");
    setPausing(true);
    try {
      await api.patch("/v1/user/test-progress", {
        sectionId: String(resolvedSectionId),
        questionIndex: currentQIdx,
        answers,
        timeRemainingSeconds: timeRemaining,
      });
      navigate("/dashboard", { replace: true, state: { pausedTest: true } });
    } catch (err) {
      setPauseError(err?.response?.data?.msg || "Failed to pause test. Please try again.");
    } finally {
      setPausing(false);
    }
  };

  const handleFinishSection = () => {
    const updatedCompleted = Array.from(new Set([...completedIds, String(resolvedSectionId)]));
    saveCompletedSectionIds(updatedCompleted);

    const remainingSections = selectedSections.filter((s) => !updatedCompleted.includes(String(s.id)));

    if (remainingSections.length === 0) {
      submitTest();
      return;
    }

    const timeElapsedSeconds = (section.durationMinutes * 60) - timeRemaining;
    const questionsSoFar = selectedSections
      .filter((s) => updatedCompleted.includes(String(s.id)))
      .reduce((sum, s) => sum + (s.questions?.length || 0), 0);

    navigate("/sectionbreak", {
      replace: true,
      state: {
        completedSection: section.name,
        completedSectionIndex: updatedCompleted.length,
        totalSections: selectedSections.length,
        questionsSoFar,
        totalQuestions,
        timeElapsedMinutes: Math.round(timeElapsedSeconds / 60),
        remainingSections: remainingSections.map((s) => ({
          id: s.id,
          name: s.name,
          durationMinutes: s.durationMinutes || 20,
        })),
      },
    });
  };

  const formatTime = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;

  if (!section || loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[#65758B]">Loading test...</p>
      </div>
    );
  }

  const willHaveRemaining = selectedSections.some(
    (s) => !completedIds.includes(String(s.id)) && String(s.id) !== String(resolvedSectionId)
  );

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 sm:px-6 md:px-8 py-6 md:py-8">
      <div className="max-w-6xl mx-auto rounded-[28px] border border-[#E1E7EF] bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap justify-between items-center gap-4 px-5 sm:px-8 py-5 border-b border-[#E1E7EF]">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F1729]">{section.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-base sm:text-lg font-semibold text-[#0F1729]">{formatTime(timeRemaining)}</span>
            <button type="button" onClick={handlePauseTest} disabled={pausing} className="flex items-center gap-2 px-4 py-2 border-2 border-[#188B8B] rounded-xl text-sm font-semibold text-[#188B8B] bg-white hover:bg-teal-50 disabled:opacity-60 disabled:cursor-not-allowed">
              <IoPause className="text-lg" /> Pause Test
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-4 text-sm text-[#65758B] mb-3">
              <p>Answered {answeredQuestions} of {totalQuestions}</p>
              <p className="font-semibold">{progressPercent}% Complete</p>
            </div>
            <div className="h-2 bg-[#E1E7EF] rounded-full overflow-hidden mb-6">
              <div className="h-full bg-[#188B8B] rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="space-y-4 mb-6">
              {questions.map((question, idx) => {
                const questionMeta = getQuestionMeta(question);
                const options = getOptionsByType(questionMeta.questionType);
                const answer = answers[key(String(resolvedSectionId), idx)];
                const showSubsectionTitle =
                  questionMeta.subsection &&
                  questionMeta.subsection !== getQuestionMeta(questions[idx - 1])?.subsection;

                return (
                  <div key={`${resolvedSectionId}-${idx}`} className="space-y-4">
                    {showSubsectionTitle && (
                      <div className="rounded-2xl border border-[#CFE8E8] bg-[#F5FBFB] px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#188B8B]">Subsection</p>
                        <p className="mt-1 text-base font-semibold text-[#0F1729]">{questionMeta.subsection}</p>
                      </div>
                    )}

                    <div className="bg-white rounded-2xl border border-[#E1E7EF] shadow-sm p-5 sm:p-8">
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <p className="text-sm font-semibold text-[#188B8B]">Question {completedQuestions + idx + 1}</p>
                        {answer != null && <p className="text-xs font-semibold text-emerald-600">Answered</p>}
                      </div>
                      <p className="text-lg sm:text-xl font-semibold text-[#0F1729] mb-6">{questionMeta.text}</p>
                      <div className="space-y-3">
                        {options.map((opt) => (
                          <label key={opt.value} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${answer === opt.value ? "border-[#188B8B] bg-[rgba(24,139,139,0.06)]" : "border-[#E1E7EF] bg-white hover:border-gray-300"}`}>
                            <input
                              type="radio"
                              name={`section-${resolvedSectionId}-question-${idx}`}
                              value={opt.value}
                              checked={answer === opt.value}
                              onChange={() => handleOptionSelect(idx, opt.value)}
                              className="w-4 h-4 text-[#188B8B] border-gray-300 focus:ring-[#188B8B]"
                            />
                            <span className="text-sm font-medium text-[#0F1729]">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-4">
              <button type="button" onClick={handleFinishSection} className="min-w-[160px] px-6 py-3 bg-[#F7C767] text-[#0F1729] rounded-2xl font-semibold hover:bg-[#f4bb40]">
                {willHaveRemaining ? "Finish Section" : "Submit Test"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-[rgba(24,139,139,0.08)] px-4 py-3 text-center text-sm text-[#0F1729]">
              Your progress is automatically saved. You can pause once and return within 24 hours.
            </div>

            {pauseError && <p className="mt-3 text-center text-sm text-rose-600">{pauseError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Livetest;
