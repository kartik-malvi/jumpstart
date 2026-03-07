import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Pretest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState({ completedSectionIds: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/v1/user/package/current"), api.get("/v1/user/test-progress")])
      .then(([pkgRes, progressRes]) => {
        setSections(pkgRes?.data?.data?.sections || []);
        setProgress(progressRes?.data?.data || { completedSectionIds: [] });
      })
      .catch((err) => {
        setError(err?.response?.data?.msg || "Failed to load test setup");
      })
      .finally(() => setLoading(false));
  }, []);

  const completedSet = useMemo(
    () => new Set((progress.completedSectionIds || []).map((n) => Number(n))),
    [progress.completedSectionIds]
  );

  const totalQuestions = sections.reduce((sum, s) => sum + (s.totalQuestions || 0), 0);

  const handleStartSection = (sectionId) => {
    navigate(`/livetest/${sectionId}`);
  };

  const handleSubmitAssessment = () => {
    setSubmitting(true);
    api
      .post("/v1/user/test-submit", {})
      .then(() => navigate("/test-completed", { replace: true }))
      .catch((err) => setError(err?.response?.data?.msg || "Failed to submit assessment"))
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[#65758B]">Loading assessment setup...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 sm:px-6 md:px-8 py-8 flex justify-center">
      <div className="w-full max-w-5xl space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-[#0F1729]">Assessment Sections</h2>
          <p className="mt-2 text-[#65758B]">
            Select any section to start. You can complete sections in your preferred order.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-[#65758B]">Total Sections</p>
              <p className="text-xl font-semibold text-[#0F1729]">{sections.length}</p>
            </div>
            <div>
              <p className="text-sm text-[#65758B]">Questions Loaded</p>
              <p className="text-xl font-semibold text-[#0F1729]">{totalQuestions}</p>
            </div>
            <div>
              <p className="text-sm text-[#65758B]">Completed Sections</p>
              <p className="text-xl font-semibold text-[#0F1729]">{completedSet.size}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => {
            const completed = completedSet.has(Number(section.sectionId));
            return (
              <div key={section.sectionId} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-[#0F1729]">
                    Section {section.sectionId}: {section.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      completed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {completed ? "Completed" : "Pending"}
                  </span>
                </div>
                <p className="text-sm text-[#65758B] mt-2">
                  Duration: {section.durationMinutes || 20} mins • Questions: {section.totalQuestions || 0}
                </p>
                <button
                  type="button"
                  onClick={() => handleStartSection(section.sectionId)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-[#188B8B] text-white font-semibold hover:bg-teal-700 transition"
                >
                  {completed ? "Review / Retake Section" : "Start Section"}
                </button>
              </div>
            );
          })}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          onClick={handleSubmitAssessment}
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-[#F59F0A] text-[#0F1729] font-semibold hover:bg-amber-500 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Final Assessment"}
        </button>
      </div>
    </div>
  );
}
