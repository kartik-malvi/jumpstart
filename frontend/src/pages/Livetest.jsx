import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoPause, IoDocumentTextOutline } from "react-icons/io5";
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
  const [autoSaved, setAutoSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentQuestion = questions[currentQIdx];
  const currentMeta = getQuestionMeta(currentQuestion);
  const currentOptions = getOptionsByType(currentMeta.questionType);

  const totalQuestions = selectedSections.reduce((sum, s) => sum + (s.questions?.length || 0), 0);
  const completedQuestions = selectedSections
    .filter((s) => completedIds.includes(String(s.id)) && String(s.id) !== String(resolvedSectionId))
    .reduce((sum, s) => sum + (s.questions?.length || 0), 0);

  const key = (s, q) => `${s}-${q}`;
  const currentAnswer = answers[key(String(resolvedSectionId), currentQIdx)];

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

  const saveProgress = useCallback(
    (payload = {}) => {
      setSaving(true);
      const body = {
        sectionId: String(resolvedSectionId),
        questionIndex: currentQIdx,
        answers,
        timeRemainingSeconds: timeRemaining,
        ...payload,
      };
      api
        .patch("/v1/user/test-progress", body)
        .then(() => {
          setAutoSaved(true);
          setTimeout(() => setAutoSaved(false), 2000);
        })
        .finally(() => setSaving(false));
    },
    [resolvedSectionId, currentQIdx, answers, timeRemaining]
  );

  const handleOptionSelect = (value) => {
    const newAnswers = { ...answers, [key(String(resolvedSectionId), currentQIdx)]: value };
    setAnswers(newAnswers);
    setSaving(true);
    api
      .patch("/v1/user/test-progress", {
        sectionId: String(resolvedSectionId),
        questionIndex: currentQIdx,
        answers: newAnswers,
        timeRemainingSeconds: timeRemaining,
      })
      .then(() => {
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      })
      .finally(() => setSaving(false));
  };

  const globalQuestionNumber = completedQuestions + currentQIdx + 1;
  const progressPercent = totalQuestions > 0 ? Math.round((globalQuestionNumber / totalQuestions) * 100) : 0;

  const goPrev = () => {
    if (currentQIdx > 0) {
      setCurrentQIdx(currentQIdx - 1);
      saveProgress({ questionIndex: currentQIdx - 1 });
    }
  };

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

    setSaving(true);
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
      })
      .finally(() => setSaving(false));
  };

  const goNext = () => {
    if (currentQIdx < questionsInSection - 1) {
      setCurrentQIdx(currentQIdx + 1);
      saveProgress({ questionIndex: currentQIdx + 1 });
      return;
    }

    saveProgress({ questionIndex: currentQIdx });

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
    <div className="min-h-screen bg-[#fafafa] px-4 sm:px-6 md:px-8 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F1729]">{section.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-[#0F1729]">{formatTime(timeRemaining)}</span>
            <button type="button" className="flex items-center gap-2 px-4 py-2 border border-[#E1E7EF] rounded-xl text-sm font-medium text-[#0F1729] hover:bg-gray-50">
              <IoPause className="text-lg" /> Pause Test
            </button>
          </div>
        </div>

        <p className="text-sm text-[#65758B] mb-1">Question {globalQuestionNumber} of {totalQuestions}</p>
        <div className="h-2 bg-[#E1E7EF] rounded-full overflow-hidden mb-2">
          <div className="h-full bg-[#188B8B] rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="text-xs text-[#65758B] mb-6">{progressPercent}% Complete</p>

        <div className="bg-white rounded-2xl border border-[#E1E7EF] shadow-sm p-6 sm:p-8 mb-6">
          <p className="text-lg font-semibold text-[#0F1729] mb-6">{currentMeta.text}</p>
          <div className="space-y-3">
            {currentOptions.map((opt) => (
              <label key={opt.value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${currentAnswer === opt.value ? "border-[#188B8B] bg-[rgba(24,139,139,0.06)]" : "border-[#E1E7EF] bg-white hover:border-gray-300"}`}>
                <input type="radio" name="dynamic-option" value={opt.value} checked={currentAnswer === opt.value} onChange={() => handleOptionSelect(opt.value)} className="w-4 h-4 text-[#188B8B] border-gray-300 focus:ring-[#188B8B]" />
                <span className="text-sm font-medium text-[#0F1729]">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <button type="button" onClick={goPrev} disabled={currentQIdx === 0} className="px-6 py-2.5 border-2 border-[#188B8B] text-[#188B8B] rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-50">Previous</button>
            {autoSaved && <span className="flex items-center gap-2 text-sm text-[#65758B]"><IoDocumentTextOutline className="text-lg" />Auto-saved</span>}
            <button type="button" onClick={goNext} disabled={saving} className="px-6 py-2.5 bg-[#F59F0A] text-[#0F1729] rounded-xl font-semibold hover:bg-amber-500 disabled:opacity-70">{currentQIdx < questionsInSection - 1 ? "Next" : willHaveRemaining ? "Finish Section" : "Submit Test"}</button>
          </div>
          <div className="w-full max-w-xl py-3 px-4 bg-[rgba(24,139,139,0.08)] rounded-xl text-center text-sm text-[#0F1729]">Your progress is automatically saved.</div>
        </div>
      </div>
    </div>
  );
};

export default Livetest;
