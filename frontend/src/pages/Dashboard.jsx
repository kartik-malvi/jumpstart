import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CheckCircle, PlayCircle, FileText, Video, Calendar, HelpCircle } from "lucide-react";
import api from "../api/api";
import di1 from "../assets/di1.png";
import di2 from "../assets/di2.png";
import di3 from "../assets/di3.png";

const Dashboard = () => {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [resumeSectionId, setResumeSectionId] = useState(null);
  const [stats, setStats] = useState({
    tests_completed: 0,
    tests_in_progress: 0,
    reports_ready: 0,
    counselling_sessions: 0,
    user_name: user?.name || "User",
    available_tests: [],
    top_careers: [],
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/v1/user/init")
      .then(async (res) => {
        const d = res?.data?.data;

        if (!d) {
          console.warn("API returned no data, using fallback");
          return;
        }

        setStats({
          tests_completed: d.tests_completed ?? 0,
          tests_in_progress: d.tests_in_progress ?? 0,
          reports_ready: d.reports_ready ?? 0,
          counselling_sessions: d.counselling_sessions ?? 0,
          user_name: d.user?.name || user?.name || "User",
          available_tests: d.available_tests || [],
          top_careers: d.top_careers || [],
        });

        if ((d.tests_in_progress ?? 0) > 0) {
          try {
            const progressRes = await api.get("/v1/user/test-progress");
            const sectionId = progressRes?.data?.data?.sectionId;
            setResumeSectionId(sectionId ? String(sectionId) : null);
          } catch (progressErr) {
            console.error("Failed to load resume progress:", progressErr);
            setResumeSectionId(null);
          }
        } else {
          setResumeSectionId(null);
        }
      })
      .catch((err) => {
        console.error("Dashboard API Error:", err);
        setStats((prev) => ({
          ...prev,
          user_name: user?.name || "User",
        }));
      })
      .finally(() => setLoading(false));
  }, [token, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading dashboard...
      </div>
    );
  }

  const statCards = [
    { label: "Tests Completed", value: stats.tests_completed, icon: CheckCircle, color: "text-emerald-500", bgColor: "bg-emerald-50" },
    { label: "Tests in Progress", value: stats.tests_in_progress, icon: PlayCircle, color: "text-amber-500", bgColor: "bg-amber-50" },
    { label: "Reports Ready", value: stats.reports_ready, icon: FileText, color: "text-blue-500", bgColor: "bg-blue-50" },
    { label: "Counselling Sessions", value: stats.counselling_sessions, icon: Video, color: "text-slate-600", bgColor: "bg-slate-100" },
  ];

  const careerIcons = [di3, di2, di1];

  return (
    <div className="mx-auto max-w-7xl min-h-screen p-8 pb-12">
        <h1 className="text-3xl font-bold text-[#0F1729]">
          Welcome, {stats.user_name}!
        </h1>
        <p className="text-[#65758B] mt-1 text-base">
          Track your progress and continue your career discovery journey
        </p>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start justify-between"
              >
                <div>
                  <p className="text-gray-500 text-sm">{card.label}</p>
                  <h2 className={`text-4xl font-bold mt-1 ${card.color}`}>
                    {card.value}
                  </h2>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor} ${card.color}`}>
                  <Icon size={24} strokeWidth={2} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Available Tests */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#0F1729]">Available Tests</h2>
            <p className="text-[#65758B] mt-1 text-base mb-6">
              View and manage your aptitude tests
            </p>

            {(location.state?.pausedTest || resumeSectionId) && (
              <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-4">
                <p className="text-sm text-[#0F1729] font-semibold">Your test is paused.</p>
                <p className="text-sm text-[#65758B] mt-1">Resume from where you left off within 24 hours.</p>
                {resumeSectionId && (
                  <Link
                    to={`/livetest/${resumeSectionId}`}
                    className="inline-flex mt-3 items-center justify-center rounded-xl bg-[#188B8B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
                  >
                    Continue Test
                  </Link>
                )}
              </div>
            )}

            {stats.available_tests && stats.available_tests.length > 0 ? (
              <div className="space-y-4">
                {stats.available_tests.map((t, i) => (
                  <div
                    key={t.title || i}
                    className="border border-[#E1E7EF] rounded-xl p-4 hover:bg-gray-50/50 transition"
                  >
                    <h3 className="font-semibold text-[#0F1729]">{t.title}</h3>
                    <p className="text-[#65758B] text-sm mt-1">
                      Total Duration: {t.durationMinutes ?? 180} Minutes
                    </p>
                    <p className="text-[#65758B] text-sm">
                      Total Questions: {t.totalQuestions ?? 500}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#65758B]">
                No tests assigned yet. Purchase a package to unlock tests.
              </p>
            )}

            <Link
              to="/test"
              className="block w-full mt-6 border-2 border-[#188B8B] text-[#188B8B] py-2.5 rounded-[14px] font-medium text-center hover:bg-teal-50 transition"
            >
              Browse More Tests
            </Link>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Top Career Matches */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#0F1729]">Top Career Matches</h2>
              <p className="text-sm text-[#65758B] mb-4">Based on your results</p>

              {stats.top_careers && stats.top_careers.length > 0 ? (
                <div className="space-y-3">
                  {stats.top_careers.map((c, index) => {
                    const icon = careerIcons[index % careerIcons.length];
                    return (
                      <div
                        key={c.title + index}
                        className="bg-teal-50 p-3 rounded-xl flex items-center gap-3 border border-teal-100"
                      >
                        <img src={icon} alt="" className="w-10 h-10 object-contain" />
                        <div>
                          <p className="text-sm font-semibold text-[#0F1729]">{c.title}</p>
                          <p className="text-xs text-[#65758B]">
                            {(c.matchPercent ?? c.match ?? 0)}% match
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[#65758B]">
                  Complete your tests to see personalized career matches here.
                </p>
              )}

              <Link
                to="/result"
                className="block w-full mt-4 text-[#188B8B] font-medium text-center hover:underline"
              >
                View All Matches →
              </Link>
            </div>

            {/* Book Counselling */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#0F1729] mb-2">Book Counselling</h2>
              <p className="text-sm text-[#65758B] mb-2">Get expert guidance</p>
              <p className="text-sm text-gray-500 mb-4">
                Schedule a one-on-one session with our psychologists to discuss your results.
              </p>

              <Link
                to="/bookcounselling"
                className="flex items-center justify-center gap-2 w-full bg-amber-500 text-[#0F1729] font-semibold py-2.5 rounded-lg hover:bg-amber-600 transition"
              >
                <Calendar size={18} />
                <span>Book Session</span>
              </Link>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#0F1729] mb-4">Need Help?</h2>

              <button
                type="button"
                className="flex items-center gap-2 w-full px-4 py-2.5 border border-gray-200 rounded-lg text-left font-medium text-[#0F1729] hover:bg-gray-50 transition mb-2"
              >
                <HelpCircle size={18} />
                <span>Help Center</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-2 w-full px-4 py-2.5 border border-gray-200 rounded-lg text-left font-medium text-[#0F1729] hover:bg-gray-50 transition"
              >
                <Video size={18} />
                <span>Video Tutorials</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
