import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import downloadIcon from "../assets/down.svg";
import printIcon from "../assets/prnt.svg";
import prsonIcon from "../assets/prson.svg";
import categIcon from "../assets/categ.svg";
import fitIcon from "../assets/fit.svg";
import SchduleIcon from "../assets/schdule.svg";
import { buildResultReportModel, openResultReportPdf, openResultReportPreview } from "../utils/resultReport";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "strengths", label: "Strengths" },
  { id: "interests", label: "Interests" },
  { id: "career-paths", label: "Career Paths" },
  { id: "next-steps", label: "Next Steps" },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const getReadinessLabel = (score) => {
  if (score == null) return "Complete assessment";
  if (score >= 80) return "Excellent career readiness";
  if (score >= 60) return "Good career readiness";
  if (score >= 40) return "Moderate readiness";
  return "Keep building skills";
};

const formatSectionResult = (result, index) => {
  const score = result?.score;
  const maxScore = result?.maxScore;
  const fallbackPercent =
    maxScore > 0 && score != null ? Math.round((Number(score) / Number(maxScore)) * 100) : null;

  return {
    id: result?.sectionId || `section-${index + 1}`,
    title: result?.sectionName || result?.testName || `Section ${index + 1}`,
    score: score != null ? Number(score) : null,
    maxScore: maxScore != null ? Number(maxScore) : null,
    percentage: result?.percentage ?? fallbackPercent,
    completedAt: result?.completedAt,
  };
};

const Result = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({
    hasResults: false,
    overallScore: null,
    overallPercentile: "",
    completedTestsCount: 0,
    totalTestsCount: 0,
    careerPathwaysCount: 0,
    testResults: [],
    strengths: [],
    careerRecommendations: [],
    personalityType: null,
  });

  useEffect(() => {
    api
      .get("/v1/user/results")
      .then((res) => {
        const d = res?.data?.data;
        if (d) setData(d);
      })
      .catch((err) => {
        setError(err.response?.data?.msg || "Failed to load results");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <p className="text-[#65758B]">Loading your results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/dashboard" className="text-[#188B8B] font-medium hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const hasAnyContent =
    data.hasResults ||
    (data.testResults && data.testResults.length > 0) ||
    (data.strengths && data.strengths.length > 0) ||
    (data.careerRecommendations && data.careerRecommendations.length > 0) ||
    (data.personalityType && data.personalityType.code);

  if (!hasAnyContent) {
    return (
      <div className="min-h-screen bg-[#fafafa] p-6 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F1729] mb-2">Your Career Profile</h2>
          <p className="text-[#65758B] mb-6">Complete your aptitude tests to see your personalized results here.</p>
          <Link
            to="/test"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#188B8B] text-white rounded-[14px] font-semibold hover:bg-teal-700"
          >
            Browse Test Packages
          </Link>
          <p className="mt-6 text-sm text-[#65758B]">
            Already have an account? <Link to="/dashboard" className="text-[#188B8B] font-medium hover:underline">Go to Dashboard</Link>
          </p>
        </div>
      </div>
    );
  }

  const personality = data.personalityType || {};
  const topCareer = (data.careerRecommendations || [])[0];
  const defaultTraitNames = ["Analytical Thinking", "Creativity", "Leadership", "Communication"];
  const defaultTraitValues = [92, 78, 85, 80];
  const personalityTraits = defaultTraitNames.map((name, i) => {
    const s = data.strengths && data.strengths[i];
    return { name: (s && s.name) || name, value: (s && s.value != null) ? s.value : defaultTraitValues[i] };
  });
  const sectionResults = (data.testResults || []).map(formatSectionResult);

  const reportModel = buildResultReportModel({
    ...data,
    generatedAt: new Date().toISOString(),
  });

  const handlePrint = () => openResultReportPreview(reportModel);
  const handleDownloadPdf = () => openResultReportPdf(reportModel);

  return (
    <div className="min-h-screen bg-[#fafafa] pb-16 sm:pb-20">
      {/* Top banner */}
      <div className="w-full bg-[#E8F4F8] border-b border-[#E1E7EF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
          <p className="text-sm font-medium text-[#0F1729]">Detailed career report</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-10">
        {/* Title + actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1729]">Your Detailed Career Report</h1>
            <p className="text-[#65758B] mt-1 text-sm sm:text-base">Comprehensive analysis of your career aptitude assessment.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F1729] bg-[#E8F4F8] border border-[#188B8B]/30 rounded-lg hover:bg-[#D4EDF0]"
            >
              <img src={printIcon} alt="Print" className="w-4 h-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#F59F0A] hover:bg-[#D97706] rounded-lg"
            >
              <img src={downloadIcon} alt="Download" className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-[#E1E7EF] mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition ${
                activeTab === tab.id
                  ? "bg-[#E8F4F8] text-[#0F1729] border-b-2 border-[#188B8B] -mb-px"
                  : "text-[#65758B] hover:bg-[#f1f5f9]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Three summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <img src={prsonIcon} alt="" className="w-5 h-5 text-[#188B8B]" />
                  <span className="text-sm font-medium text-[#65758B]">Overall Score</span>
                </div>
                <p className="text-2xl font-bold text-[#0F1729]">
                  {data.overallScore != null ? data.overallScore : "—"}/100
                </p>
                <p className="text-sm text-[#65758B] mt-1">{getReadinessLabel(data.overallScore)}</p>
                <div className="mt-3 h-2 bg-[#E1E7EF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#188B8B] rounded-full transition-all"
                    style={{ width: `${Math.min(100, data.overallScore ?? 0)}%` }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <img src={categIcon} alt="" className="w-5 h-5" />
                  <span className="text-sm font-medium text-[#65758B]">Top Category</span>
                </div>
                <p className="text-lg font-bold text-[#0F1729]">
                  {(topCareer && (topCareer.category || topCareer.title)) || (data.strengths?.[0]?.name) || "—"}
                </p>
                <p className="text-sm text-[#65758B] mt-1">
                  {topCareer?.description || data.strengths?.[0]?.desc || "Strong analytical and problem-solving skills"}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <img src={fitIcon} alt="" className="w-5 h-5" />
                  <span className="text-sm font-medium text-[#65758B]">Best Fit</span>
                </div>
                <p className="text-lg font-bold text-[#0F1729]">{topCareer?.title || "—"}</p>
                <p className="text-sm text-[#188B8B] font-semibold mt-1">
                  {topCareer?.matchPercent != null ? `${topCareer.matchPercent}% match with your profile` : "Complete tests to see match"}
                </p>
              </div>
            </div>

            {/* Four section results */}
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-[#0F1729] mb-4">Section Results</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sectionResults.length > 0 ? sectionResults.map((sec) => (
                  <div key={sec.id} className="border border-[#E1E7EF] rounded-lg p-4">
                    <p className="font-semibold text-[#0F1729]">{sec.title}</p>
                    <p className="text-sm text-[#65758B] mt-1">
                      Score: {sec.score != null && sec.maxScore != null ? `${sec.score}/${sec.maxScore}` : "—"}
                    </p>
                    {sec.percentage != null && (
                      <p className="text-sm text-[#188B8B] mt-1 font-medium">{sec.percentage}%</p>
                    )}
                    {sec.completedAt && (
                      <p className="text-xs text-[#65758B] mt-1">Completed {formatDate(sec.completedAt)}</p>
                    )}
                  </div>
                )) : (
                  <p className="text-[#65758B]">No section scores available yet.</p>
                )}
              </div>
            </div>

            {/* Personality Profile */}
            <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-[#0F1729] mb-4">Personality Profile</h3>
              <div className="space-y-4">
                {personalityTraits.map((t, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-[#0F1729]">{t.name}</span>
                      <span className="text-sm font-semibold text-[#188B8B]">{t.value}%</span>
                    </div>
                    <div className="h-2 bg-[#E1E7EF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#188B8B] rounded-full"
                        style={{ width: `${Math.min(100, t.value)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "strengths" && (
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0F1729] mb-4">Your Strengths</h3>
            {data.strengths && data.strengths.length > 0 ? (
              <div className="space-y-4">
                {data.strengths.map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-[#0F1729]">{skill.name}</span>
                      <span className="text-sm font-bold text-[#188B8B]">{skill.value}%</span>
                    </div>
                    <div className="h-2 bg-[#E1E7EF] rounded-full overflow-hidden">
                      <div className="h-full bg-[#188B8B] rounded-full" style={{ width: `${Math.min(100, skill.value)}%` }} />
                    </div>
                    {skill.desc && <p className="text-xs text-[#65758B] mt-1">{skill.desc}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#65758B]">Complete more tests to see your strengths.</p>
            )}
          </div>
        )}

        {activeTab === "interests" && (
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0F1729] mb-4">Interests</h3>
            {personality.title && (
              <p className="text-[#0F1729] font-medium">{personality.code} — {personality.title}</p>
            )}
            {personality.description && <p className="text-[#65758B] mt-2 text-sm">{personality.description}</p>}
            {(!personality.code && !personality.description) && (
              <p className="text-[#65758B]">Your interest profile will appear here after completing the assessment.</p>
            )}
          </div>
        )}

        {activeTab === "career-paths" && (
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0F1729] mb-4">Career Paths</h3>
            {data.careerRecommendations && data.careerRecommendations.length > 0 ? (
              <div className="space-y-4">
                {data.careerRecommendations.map((career, idx) => (
                  <div key={idx} className="border border-[#E1E7EF] rounded-lg p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#0F1729]">{career.title}</span>
                      <span className="text-xs bg-[#188B8B]/10 text-[#188B8B] px-2 py-0.5 rounded-full font-semibold">
                        {career.matchPercent}% Match
                      </span>
                    </div>
                    {career.description && <p className="text-sm text-[#65758B] mt-2">{career.description}</p>}
                    {career.skills && career.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {career.skills.map((s, i) => (
                          <span key={i} className="text-xs bg-[#0B6565] text-white px-2 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <Link to="/bookcounselling" className="inline-block mt-4 text-[#188B8B] font-medium hover:underline">
                  For more career advice, book a call
                </Link>
              </div>
            ) : (
              <p className="text-[#65758B]">Complete tests to see career path recommendations.</p>
            )}
          </div>
        )}

        {activeTab === "next-steps" && (
          <div className="bg-white rounded-xl border border-[#E1E7EF] p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0F1729] mb-4">Next Steps</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 bg-[#E8F4F8] rounded-xl p-3">
                <span className="w-8 h-8 bg-[#188B8B] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <span className="font-medium text-[#0F1729]">Book Counseling</span>
                  <p className="text-xs text-[#65758B]">Discuss results with a psychologist</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#E8F4F8] rounded-xl p-3">
                <span className="w-8 h-8 bg-[#0B6565] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <span className="font-medium text-[#0F1729]">Explore Career Paths</span>
                  <p className="text-xs text-[#65758B]">Research your top matches in detail</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#E8F4F8] rounded-xl p-3">
                <span className="w-8 h-8 bg-[#F59F0A] text-[#0F1729] rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <span className="font-medium text-[#0F1729]">Create Action Plan</span>
                  <p className="text-xs text-[#65758B]">Set goals and milestones</p>
                </div>
              </div>
            </div>
            <Link
              to="/bookcounselling"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F59F0A] text-[#0F1729] font-semibold rounded-lg hover:bg-[#D97706]"
            >
              <img src={SchduleIcon} alt="" className="w-4 h-4" />
              Schedule Counselling
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Result;
