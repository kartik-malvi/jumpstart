import React, { useState } from "react";
import printIcon from "../assets/prnt.svg";
import downloadIcon from "../assets/downld.svg";
import score from "../assets/score.svg";
import fit from "../assets/fit.svg";
import categ from "../assets/categ.svg";

const Careerdetail = () => {
  const tabs = [
    "Overview",
    "Strengths",
    "Interests",
    "Career Paths",
    "Next Steps",
  ];
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="min-h-screen p-6 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-16 sm:pb-20 md:pb-[100px]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0F1729]">
              Your Detailed Career Report
            </h2>
            <p className="!text-base text-[#65758B] mt-1">
              Comprehensive analysis of your career aptitude assessment
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-[#188B8B] text-[#188B8B] rounded-[14px] bg-white shadow-sm">
              <img src={printIcon} alt="Print" className="w-4 h-4" /> Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#F59F0A] text-black font-medium rounded-[14px] shadow">
              <img src={downloadIcon} alt="Download" className="w-4 h-4" />{" "}
              Download PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#F1F5F9] rounded-[14px] p-2 mb-8 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-[14px] text-sm font-medium transition text-center ${
                activeTab === tab
                  ? "bg-white text-slate-900"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Content */}
        {activeTab === "Overview" && (
          <>
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_0_rgba(0,0,0,0.18)] border-[#E1E7EF]">
                <div className="flex gap-2 pb-5">
                  <img src={score} alt="score" />
                  <p className="text-lg !font-semibold !text-[#0F1729] !font-[poppins]">
                    Overall Score
                  </p>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#188B8B] mt-2 font-inter">
                  85/100
                </h2>
                <div className="w-full h-3 bg-[#0B6565] rounded-full mt-4">
                  <div className="h-3 bg-[#188B8B] rounded-full w-[85%]" />
                </div>
                <p className="!text-sm !text-[#65758B] mt-2">
                  Excellent career readiness
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_0_rgba(0,0,0,0.18)] border-[#E1E7EF]">
                <div className="flex gap-2 pb-5">
                  <img src={categ} alt="score" />
                  <p className="text-lg !font-semibold !text-[#0F1729] !font-[poppins]">
                    Top Category
                  </p>
                </div>
                <h2 className="text-2xl font-bold text-[#0F1729] font-inter mt-2">
                  Technology
                </h2>
                <p className="!text-sm !text-[#65758B] mt-2">
                  Strong analytical and problem-solving skills
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_0_rgba(0,0,0,0.18)] border-[#E1E7EF]">
                <div className="flex gap-2 pb-5">
                  <img src={fit} alt="fit" />
                  <p className="text-lg !font-semibold !text-[#0F1729] !font-[poppins]">Best Fit</p>
                </div>
                <h2 className="text-2xl font-bold text-[#0F1729] font-inter mt-2">
                  Software Engineer
                </h2>
                <p className="!text-sm !text-[#65758B] mt-2">
                  92% match with your profile
                </p>
              </div>
            </div>

            {/* Personality Profile */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_0_rgba(0,0,0,0.18)] border-[#E1E7EF]">
              <h3 className="text-2xl font-semibold text-[#0F1729] mb-5">
                Personality Profile
              </h3>

              {[
                { name: "Analytical Thinking", value: 92 },
                { name: "Creativity", value: 78 },
                { name: "Leadership", value: 85 },
                { name: "Communication", value: 80 },
              ].map((item) => (
                <div key={item.name} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#0F1729] font-inter font-medium">{item.name}</span>
                    <span className="font-semibold text-[#0F1729] font-inter">
                      {item.value}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#0B6565] rounded-full">
                    <div
                      className="h-3 bg-[#188B8B] rounded-full"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Other Tabs Placeholder */}
        {activeTab !== "Overview" && (
          <div className="bg-white rounded-2xl p-10 shadow-sm border text-center text-slate-500">
            {activeTab} content will go here
          </div>
        )}
      </div>
    </div>
  );
};

export default Careerdetail;
