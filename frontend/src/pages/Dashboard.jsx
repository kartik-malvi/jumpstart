import React, { useEffect, useState, useContext } from "react";
import Header from "../components/Header";
import Footer from "../components/footer";
import { AuthContext } from "../context/AuthContext";

import {
  IoDocumentTextOutline,
  IoVideocamOutline,
  IoCalendarClearOutline,
} from "react-icons/io5";

import api from "../api/api";

import di1 from "../assets/di1.png";
import di2 from "../assets/di2.png";
import di3 from "../assets/di3.png";
import bg1 from "../assets/bg1.png";
import bg2 from "../assets/bg2.png";
import bg3 from "../assets/bg3.png";
import bg4 from "../assets/bg4.png";

const Dashboard = () => {
  const { token, user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tests_completed: 0,
    tests_in_progress: 0,
    reports_ready: 0,
    counselling_sessions: 0,
    user_name: user?.name || "User",
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("https://jumpstart-backend.alwaysdata.net/api/v1/user/init", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
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
        });
      })
      .catch((err) => {
        console.error("Dashboard API Error:", err);

        // fallback dummy data
        setStats({
          tests_completed: 3,
          tests_in_progress: 1,
          reports_ready: 2,
          counselling_sessions: 0,
          user_name: user?.name || "User",
        });
      })
      .finally(() => setLoading(false));
  }, [token, user]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center text-xl">
          Loading dashboard...
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl min-h-screen p-8 pb-30">
        <h1 className="!text-[36px] font-semibold text-gray-800">
          Welcome, {stats.user_name}!
        </h1>
        <p className="text-[#65758B] mt-1 !text-[16px]">
          Track your progress and continue your career discovery journey
        </p>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div
            className="bg-white shadow rounded-xl p-4 custom_dropshadow bg-no-repeat bg-[length:15%] bg-[90%]"
            style={{ backgroundImage: `url(${bg1})` }}
          >
            <p className="text-gray-500 !text-[14px]">Tests Completed</p>
            <h2 className="text-4xl font-bold text-teal-500 mt-1">
              {stats.tests_completed}
            </h2>
          </div>

          <div
            className="bg-white shadow rounded-xl p-4 custom_dropshadow bg-no-repeat bg-[length:15%] bg-[90%]"
            style={{ backgroundImage: `url(${bg4})` }}
          >
            <p className="text-gray-500 !text-[14px]">Tests In Progress</p>
            <h2 className="text-4xl font-bold text-yellow-500 mt-1">
              {stats.tests_in_progress}
            </h2>
          </div>

          <div
            className="bg-white shadow rounded-xl p-4 custom_dropshadow bg-no-repeat bg-[length:15%] bg-[90%]"
            style={{ backgroundImage: `url(${bg3})` }}
          >
            <p className="text-gray-500 !text-[14px]">Reports Ready</p>
            <h2 className="text-4xl font-bold text-blue-500 mt-1">
              {stats.reports_ready}
            </h2>
          </div>

          <div
            className="bg-white shadow rounded-xl p-4 custom_dropshadow bg-no-repeat bg-[length:15%] bg-[90%]"
            style={{ backgroundImage: `url(${bg2})` }}
          >
            <p className="text-gray-500 !text-[14px]">Counselling Sessions</p>
            <h2 className="text-4xl font-bold text-green-500 mt-1">
              {stats.counselling_sessions}
            </h2>
          </div>
        </div>

        {/* Bottom Section (Your same UI) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white custom_dropshadow rounded-xl p-6 lg:col-span-2">
            <h2 className="!text-[24px] font-semibold ">Available Tests</h2>
            <p className="text-[#65758B] mt-1 !text-[16px] mb-4">
              View and manage your aptitude tests
            </p>

            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="border border-[#E1E7EF] rounded-xl p-4 mb-3 hover:bg-gray-50 transition"
                >
                  <h3 className="font-semibold !text-[16px] text-gray-800">
                    {i === 0 ? "Personality Assessment" : "Numerical Reasoning"}
                  </h3>
                  <p className="text-gray-500 !text-[16px]">
                    Total Duration: 180 Minutes
                  </p>
                  <p className="text-gray-500 !text-[16px]">
                    Total Questions: 500
                  </p>
                </div>
              ))}

            <button className="secondary-btn w-full mt-4 border-[2px] !border-[#188B8B] text-teal-600 py-2 !rounded-[14px] !text-[#188B8B] font-[500]">
              Browse More Tests
            </button>
          </div>

          <div className="space-y-6">
            {/* Career Matches */}
            <div className="bg-white custom_dropshadow rounded-xl p-6">
              <h2 className="!text-[18px] font-semibold">Top Career Matches</h2>
              <p className="!text-[14px] mb-4">Based on your results</p>

              <div className="space-y-3">
                <div className="bg-teal-50 p-3 rounded-[12px] flex items-center gap-3">
                  <img src={di3} className="w-[32px] !h-fit" />
                  <span>
                    <p className="!text-[14px] font-semibold text-[#0F1729] leading-3">
                      Data Scientist
                    </p>
                    <p className="!text-[12px] text-[#65758B]">95% match</p>
                  </span>
                </div>

                <div className="bg-teal-50 p-3 rounded-[12px] flex items-center gap-3">
                  <img src={di2} className="w-[32px] !h-fit" />
                  <span>
                    <p className="!text-[14px] font-semibold text-[#0F1729] leading-3">
                      UX Designer
                    </p>
                    <p className="!text-[12px] text-[#65758B]">89% match</p>
                  </span>
                </div>

                <div className="bg-teal-50 p-3 rounded-[12px] flex items-center gap-3">
                  <img src={di1} className="w-[32px] h-fit" />
                  <span>
                    <p className="!text-[14px] font-semibold text-[#0F1729] leading-3">
                      Business Analyst
                    </p>
                    <p className="!text-[12px] text-[#65758B]">87% match</p>
                  </span>
                </div>
              </div>

              <button className="w-full mt-4 text-teal-600 font-medium hover:underline text-center">
                View All Matches →
              </button>
            </div>

            {/* Counselling */}
            <div className="bg-white custom_dropshadow rounded-xl p-6">
              <h2 className="!text-[18px] font-semibold mb-2">
                Book Counselling
              </h2>
              <p className="!text-[14px] mb-4">Get expert guidance</p>
              <p className="text-gray-500 !text-[14px] mb-4">
                Schedule a one-on-one session with our psychologists
              </p>

              <button className="flex items-center justify-center gap-2 primary-btn w-full bg-yellow-500 text-white font-semibold py-2 rounded-lg hover:bg-yellow-600">
                <IoCalendarClearOutline />
                <span>Book Session</span>
              </button>
            </div>

            {/* Help */}
            <div className="bg-white custom_dropshadow rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Need Help?</h2>

              <button className="px-5 flex items-center gap-2 secondary-btn text-left w-full border border-gray-300 py-2 rounded-lg mb-2 font-medium hover:bg-gray-50">
                <IoDocumentTextOutline />
                <span>Help Center</span>
              </button>

              <button className="px-5 flex items-center gap-2 secondary-btn text-left w-full border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50">
                <IoVideocamOutline />
                <span>Video Tutorials</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default Dashboard;
