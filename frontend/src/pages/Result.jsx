import React from "react";
import { Link } from "react-router-dom";
import downloadIcon from "../assets/down.svg";
import ShareIcon from "../assets/share.svg";
import CompletedIcon from "../assets/completed.svg";
import Carrericon from "../assets/carrericon.svg";
import SkillIcon from "../assets/skillicon.svg";
import CircleIcon from "../assets/circleicon.svg";
import BulbIcon from "../assets/buldicon.svg";
import SchduleIcon from "../assets/schdule.svg";

const Result = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] p-6 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-16 sm:pb-20 md:pb-[100px]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0F1729]">
              Your Career Profile
            </h2>
            <p className="!text-base text-[#65758B] mt-1">
              Comprehensive analysis based on your test results
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium font-inter text-xs sm:text-sm border-2 border-[#188B8B] text-[#188B8B] rounded-[14px] hover:bg-teal-50">
              <img src={downloadIcon} alt="DownloadIcon" />
              <span>Download PDF</span>
            </button>
            <button className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium font-inter text-xs sm:text-sm border-2 border-[#188B8B] text-[#188B8B] rounded-[14px] hover:bg-teal-50">
              <img src={ShareIcon} alt="ShareIcon" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div
          className=" bg-gradient-to-br from-[rgba(24,139,139,0.05)] via-[rgba(250,250,250,1)] to-[rgba(11,101,101,0.05)] rounded-2xl p-4 sm:p-6 border-2 border-[#E1E7EF] shadow-sm mb-4 sm:mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center py-2">
              <h3 className="text-4xl sm:text-5xl font-bold text-[#188B8B] mb-2">
                88
              </h3>
              <p className="!text-sm !font-medium !text-[#0F1729]">
                Overall Score
              </p>
              <p className="!text-xs text-[#65758B]">Top 12% nationally</p>
            </div>
            <div className="text-center py-2 flex-col justify-items-center">
              <img src={CompletedIcon} alt="CompletedIcon" />
              <p className="!text-sm !font-medium !text-[#0F1729] mt-2">
                Completed Tests
              </p>
              <p className="!text-xs text-[#65758B]">3 of 4 modules</p>
            </div>
            <div className="text-center py-2 flex-col justify-items-center">
              <img src={Carrericon} alt="Carrericon" />
              <p className="!text-sm !font-medium !text-[#0F1729] mt-2">
                Career Matches
              </p>
              <p className="!text-xs text-[#65758B]">15 pathways found</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Your Tests */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border-[#E1E7EF] shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#0F1729]">
                  Your Tests
                </h3>
              </div>
              <p className="!text-sm mb-3 sm:mb-4">
                View and manage your aptitude tests
              </p>

              {/* Test Card 1 */}
              <div className="border border-[#E1E7EF] rounded-xl p-3 sm:p-4 mb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-[#0F1729] font-[poppins]">
                      Personality Assessment
                    </span>
                    <span className="text-xs bg-[#0B6565] text-white px-2 py-0.5 rounded-full font-medium font-inter">
                      Completed
                    </span>
                  </div>
                </div>
                <p className="!text-sm mb-2">Completed on Nov 28, 2024</p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <span className="text-sm text-[#65758B] font-inter font-regular">
                    Score: 88/100
                  </span>
                  <Link
                    to="#"
                    className="text-sm text-[#188B8B] font-medium font-inter"
                  >
                    View Report
                  </Link>
                </div>
              </div>

              {/* Test Card 2 */}
              <div className="border border-[#E1E7EF] rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-[#0F1729] font-[poppins]">
                      Numerical Reasoning
                    </span>
                    <span className="text-xs bg-[#0B6565] text-white px-2 py-0.5 rounded-full font-medium font-inter">
                      Completed
                    </span>
                  </div>
                </div>
                <p className="!text-sm mb-2">Completed on Nov 25, 2024</p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <span className="text-sm text-[#65758B] font-inter font-regular">
                    Score: 92/100
                  </span>
                  <Link
                    to="#"
                    className="text-sm text-[#188B8B] font-medium font-inter"
                  >
                    View Report
                  </Link>
                </div>
              </div>
            </div>

            {/* Your Strengths & Skills */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border-[#E1E7EF] shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <img src={SkillIcon} alt="SkillIcon" />
                <h3 className="text-xl sm:text-2xl font-semibold text-[#0F1729]">
                  Your Strengths & Skills
                </h3>
              </div>
              <p className="!text-sm mb-4 sm:mb-6">
                Areas where you excel based on assessments
              </p>

              {[
                {
                  name: "Analytical Thinking",
                  value: 92,
                  desc: "Exceptional ability to analyze complex problems and find logical solutions",
                },
                {
                  name: "Creative Problem Solving",
                  value: 85,
                  desc: "Strong creative thinking with innovative approaches to challenges",
                },
                {
                  name: "Communication",
                  value: 78,
                  desc: "Good ability to express ideas clearly and work in teams",
                },
                {
                  name: "Technical Aptitude",
                  value: 88,
                  desc: "Strong understanding of technical concepts and systems",
                },
                {
                  name: "Leadership Potential",
                  value: 72,
                  desc: "Developing leadership skills with room for growth",
                },
              ].map((skill, idx) => (
                <div key={idx} className="mb-4 sm:mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-inter font-medium text-[#0F1729]">
                      {skill.name}
                    </span>
                    <span className="text-sm font-bold text-[#188B8B]">
                      {skill.value}%
                    </span>
                  </div>
                  <div className="h-2 sm:h-2.5 bg-[#0B6565] rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-[#188B8B]"
                      style={{ width: `${skill.value}%` }}
                    ></div>
                  </div>
                  <p className="!text-xs">{skill.desc}</p>
                </div>
              ))}
            </div>

            {/* Top Career Recommendations */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border-[#E1E7EF] shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <img src={CircleIcon} alt="SkillIcon" />
                <h3 className="text-xl sm:text-2xl font-semibold text-[#0F1729]">
                  Top Career Recommendations
                </h3>
              </div>
              <p className="!text-sm mb-4 sm:mb-5">
                Careers that match your profile (sorted by compatibility)
              </p>

              {/* Career 1 */}
              <div className="bg-[rgba(24,139,139,0.05)] border-2 border-[rgba(24,139,139,0.2)] rounded-xl p-3 sm:p-4 mb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-[poppins] text-lg font-semibold text-[#0F1729]">
                      Data Scientist
                    </span>
                    <span className="font-inter text-xs border border[rgba(24,139,139,0.2)] bg-[rgba(24,139,139,0.1)] text-[#188B8B] px-2 py-0.5 rounded-full font-semibold">
                      95% Match
                    </span>
                  </div>
                </div>
                <p className="!text-sm mb-3">
                  Analyze complex data sets to extract insights and drive
                  business decisions
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                  <span className="font-inter text-xs bg-[#0B6565] text-white px-2 sm:px-3 py-1 rounded-full font-medium">
                    Python
                  </span>
                  <span className="font-inter text-xs bg-[#0B6565] text-white px-2 sm:px-3 py-1 rounded-full font-medium">
                    Statistics
                  </span>
                  <span className="font-inter text-xs bg-[#0B6565] text-white px-2 sm:px-3 py-1 rounded-full font-medium">
                    Machine Learning
                  </span>
                  <span className="font-inter text-xs bg-[#0B6565] text-white px-2 sm:px-3 py-1 rounded-full font-medium">
                    Data Visualization
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="font-inter text-sm text-[#65758B]">
                    Avg. Salary: ₹8-15 LPA
                  </span>
                  <Link
                    to="#"
                    className="text-sm text-[#188B8B] font-medium font-inter"
                  >
                    View Details →
                  </Link>
                </div>
              </div>

              {/* Career 2 */}
              <div className="bg-[rgba(24,139,139,0.05)] border-2 border-[rgba(24,139,139,0.2)] rounded-xl p-3 sm:p-4 mb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-[poppins] text-lg font-semibold text-[#0F1729]">
                      UX Designer
                    </span>
                    <span className="font-inter text-xs border border[rgba(24,139,139,0.2)] bg-[rgba(24,139,139,0.1)] text-[#188B8B] px-2 py-0.5 rounded-full font-semibold">
                      89% Match
                    </span>
                  </div>
                </div>
                <p className="!text-sm mb-3">
                  Create user-centered digital experiences that are intuitive
                  and delightful
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                  <span className="font-inter text-xs bg-[#0B6565] text-white px-2 sm:px-3 py-1 rounded-full font-medium">
                    Figma
                  </span>
                  <span className="font-inter text-xs bg-[#0B6565] text-white px-2 sm:px-3 py-1 rounded-full font-medium">
                    User Research
                  </span>
                  <span className="font-inter text-xs bg-[#0B6565] text-white px-2 sm:px-3 py-1 rounded-full font-medium">
                    Prototyping
                  </span>
                  <span className="font-inter text-xs bg-[#0B6565] text-white px-2 sm:px-3 py-1 rounded-full font-medium">
                    Design Systems
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="font-inter text-sm text-[#65758B]">
                    Avg. Salary: ₹6-12 LPA
                  </span>
                  <Link
                    to="#"
                    className="text-sm text-[#188B8B] font-medium font-inter"
                  >
                    View Details →
                  </Link>
                </div>
              </div>

              {/* Career 3 */}
              <div className="border border-[#E1E7EF] rounded-xl p-3 sm:p-4 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-[poppins] text-lg font-semibold text-[#0F1729]">
                      Business Analyst
                    </span>
                    <span className="font-inter text-xs border border-[#E1E7EF] text-[#0F1729] px-2 py-0.5 rounded-full font-semibold">
                      87% Match
                    </span>
                  </div>
                </div>
                <p className="!text-sm mb-3">
                  Bridge business needs with technology solutions
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                  <span className="font-inter text-xs bg-[#0B6565] text-white px-2 sm:px-3 py-1 rounded-full font-medium">
                    SQL
                  </span>
                  <span className="font-inter text-xs bg-[#0B6565] text-white px-2 sm:px-3 py-1 rounded-full font-medium">
                    Excel
                  </span>
                  <span className="font-inter text-xs bg-[#0B6565] text-white px-2 sm:px-3 py-1 rounded-full font-medium">
                    Business Strategy
                  </span>
                  <span className="font-inter text-xs bg-[#0B6565] text-white px-2 sm:px-3 py-1 rounded-full font-medium">
                    Requirements
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="font-inter text-sm text-[#65758B]">
                    Avg. Salary: ₹5-10 LPA
                  </span>
                  <Link
                    to="#"
                    className="text-sm text-[#188B8B] font-medium font-inter"
                  >
                    View Details →
                  </Link>
                </div>
              </div>

              <button className="w-full border-2 border-[#188B8B] text-[#188B8B] py-2 sm:py-2.5 rounded-[14px] font-inter text-sm font-semibold hover:bg-teal-50">
                For more career advice, book a call
              </button>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-4 sm:space-y-6">
            {/* Personality Type */}
            <div className="bg-gradient-to-br from-[rgba(245,159,10,0.1)] to-[rgba(245,159,10,0.05)] border border-[rgba(245,159,10,0.2)] rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <img src={BulbIcon} alt="BulbIcon" />
                <h3 className="text-lg font-semibold text-[#0F1729]">
                  Your Personality Type
                </h3>
              </div>
              <div className="mb-3">
                <h4 className="text-2xl font-bold text-[#0F1729] pb-2">
                  INTJ-A
                </h4>
                <span className="text-sm font-medium text-[#0F1729] font-inter">
                  The Architect
                </span>
              </div>
              <p className="!text-sm mb-4 leading-relaxed">
                Strategic, independent thinker with a natural drive for
                implementing innovative ideas
              </p>
              <div className="space-y-2 font-inter text-sm border-t pt-4 border-[#E1E7EF]">
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Introversion</span>
                  <span className="font-semibold text-[#0F1729]">65%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Intuition</span>
                  <span className="font-semibold text-[#0F1729]">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Thinking</span>
                  <span className="font-semibold text-[#0F1729]">82%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65758B]">Judging</span>
                  <span className="font-semibold text-[#0F1729]">71%</span>
                </div>
              </div>
            </div>

            {/* Recommended Next Steps */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E1E7EF]">
              <h3 className="text-lg font-semibold text-[#0F1729] mb-4">
                Recommended Next Steps
              </h3>
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 bg-[#DCF9F9] rounded-xl p-3">
                  <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-[#188B8B] text-white rounded-full flex items-center justify-center text-xs font-bold font-inter">
                    1
                  </span>
                  <div>
                    <span className="text-sm font-medium text-[#0F1729] font-inter">
                      Book Counseling
                    </span>
                    <p className="!text-xs">
                      Discuss results with a psychologist
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-[#DCF9F9] rounded-xl p-3">
                  <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-[#0B6565] text-white rounded-full flex items-center justify-center text-xs font-bold font-inter">
                    2
                  </span>
                  <div>
                    <span className="text-sm font-medium text-[#0F1729] font-inter">
                      Explore Career Paths
                    </span>
                    <p className="!text-xs">
                      Research your top matches in detail
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-[#DCF9F9] rounded-xl p-3">
                  <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-[#F59F0A] text-[#0F1729] rounded-full flex items-center justify-center text-xs font-bold font-inter">
                    3
                  </span>
                  <div>
                    <span className="text-sm font-medium text-[#0F1729] font-inter">
                      Create Action Plan
                    </span>
                    <p className="!text-xs">Set goals and milestones</p>
                  </div>
                </div>
              </div>
              <button className="w-full bg-[#F59F0A] text-[#0F1729] py-2.5 sm:py-3 font-inter rounded-[14px] text-sm font-semibold hover:bg-orange-500 flex items-center justify-center gap-2">
                <img src={SchduleIcon} alt="ScheduleIcon" />
                <span>Schedule Counselling</span>
              </button>
            </div>

            {/* Complete Your Profile */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E1E7EF]">
              <h3 className="text-lg font-semibold text-[#0F1729] mb-2">
                Complete Your Profile
              </h3>
              <p className="!text-sm mb-4">
                Take additional tests for deeper insights
              </p>
              <button className="w-full border-2 border-[#188B8B] text-[#188B8B] py-2 sm:py-2.5 rounded-[14px] font-inter text-sm font-semibold hover:bg-teal-50">
                Browse Tests
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
