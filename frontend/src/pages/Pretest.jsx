import React from "react";
import { useNavigate } from "react-router-dom";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

import Icon from "../assets/Icon-1.svg";
import Watch from "../assets/watch.svg";
import Tech from "../assets/tech.svg";
import Imp from "../assets/Imp.svg";
import { usePackageData } from "../context/PackageContext";

function PretestContent() {
  const navigate = useNavigate();
  const [checked1, setChecked1] = React.useState(false);
  const [checked2, setChecked2] = React.useState(false);

  const { activePackage } = usePackageData();
  const sections = activePackage?.sections || [];

  const totalQuestions = React.useMemo(
    () => sections.reduce((sum, s) => sum + ((s.questions || []).length || 0), 0),
    [sections]
  );

  const totalDuration = React.useMemo(
    () => sections.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0),
    [sections]
  );

  const handleStart = () => {
    if (sections.length === 0) return;
    navigate("/choose-section", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-16 sm:pb-20 md:pb-[100px] flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F1729]">Before You Begin</h2>
          <p className="mt-2 font-normal !text-base">Please review these important instructions carefully</p>
        </div>

        <div className="bg-white shadow rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <img src={Icon} alt="icon" />
            <h3 className="text-[18px] sm:text-[22px] md:text-[25.3px] font-semibold text-[#0F1729] font-inter">Test Overview</h3>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-6 sm:gap-8 md:gap-10">
            <div className="space-y-6">
              <div><p className="!text-base">Total Sections</p><div className="border-b border-gray-200 w-40 mt-1" /></div>
              <div><p className="!text-base">Total Questions</p><div className="border-b border-gray-200 w-40 mt-1" /></div>
              <div><p className="!text-base">Total Duration</p><div className="border-b border-gray-200 w-40 mt-1" /></div>
              <div><p className="!text-base">Sections</p></div>
            </div>

            <div className="flex flex-col gap-4 sm:gap-6 md:gap-7 font-medium md:text-right">
              <p className="!text-[#0F1729] !font-semibold !text-base">{sections.length} Sections</p>
              <p className="!text-[#0F1729] !font-semibold !text-base">{totalQuestions} Questions</p>
              <p className="!text-[#0F1729] !font-semibold !text-base">~{totalDuration} Minutes</p>
              <p className="!text-[#0F1729] !font-semibold !text-base">{sections.map((s) => s.name).join(", ")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-2xl p-6 border border-gray-100 space-y-2">
          <div className="flex items-center gap-2 mb-6"><img src={Watch} alt="icon" /><h3 className="text-[18px] sm:text-[22px] md:text-[25.3px] font-semibold text-[#0F1729] font-inter">Timing & Progress</h3></div>
          <ul className="space-y-2 text-[#0F1729] text-sm font-inter">
            <li className="flex items-center gap-2"><span className="text-base sm:text-lg md:text-lg"><IoIosCheckmarkCircleOutline /></span>Each section is timed individually</li>
            <li className="flex items-center gap-2"><span className="text-base sm:text-lg md:text-lg"><IoIosCheckmarkCircleOutline /></span>Progress is automatically saved after each question</li>
            <li className="flex items-center gap-2"><span className="text-base sm:text-lg md:text-lg"><IoIosCheckmarkCircleOutline /></span>You will choose which section to start first in the next step</li>
          </ul>
        </div>

        <div className="bg-white shadow rounded-2xl p-6 border border-gray-100 space-y-2">
          <div className="flex items-center gap-2 mb-6"><img src={Tech} alt="icon" /><h3 className="text-[18px] sm:text-[22px] md:text-[25.3px] font-semibold text-[#0F1729] font-inter">Technical Requirements</h3></div>
          <ul className="space-y-2 text-[#0F1729] text-sm font-inter">
            <li className="flex items-center gap-2"><span className="text-base sm:text-lg md:text-lg"><IoIosCheckmarkCircleOutline /></span>Stable internet connection</li>
            <li className="flex items-center gap-2"><span className="text-base sm:text-lg md:text-lg"><IoIosCheckmarkCircleOutline /></span>Updated browser</li>
          </ul>
        </div>

        <div className="bg-white shadow rounded-2xl p-6 border border-gray-100 space-y-2">
          <div className="flex items-center gap-2 mb-6"><img src={Imp} alt="icon" /><h3 className="text-[18px] sm:text-[22px] md:text-[25.3px] font-semibold text-[#0F1729] font-inter">Important Rules</h3></div>
          <ul className="list-disc ml-6 text-[#0F1729] space-y-2 text-sm font-inter custom-list">
            <li>Answer honestly – there are no right or wrong answers</li>
            <li>Once a section is submitted, you cannot go back to it</li>
          </ul>
        </div>

        <div className="bg-white shadow rounded-2xl p-6 border border-gray-100 space-y-4">
          <label className="flex items-center gap-3 text-sm text-[#0F1729] font-inter cursor-pointer">
            <input type="checkbox" checked={checked1} onChange={(e) => setChecked1(e.target.checked)} className="appearance-none w-4 h-4 rounded-full border border-[#188B8B] checked:bg-[#188B8B] checked:border-[#188B8B]" />
            I have checked my internet connection and browser compatibility
          </label>
          <label className="flex items-center gap-3 text-sm text-[#0F1729] font-inter cursor-pointer">
            <input type="checkbox" checked={checked2} onChange={(e) => setChecked2(e.target.checked)} className="appearance-none w-4 h-4 rounded-full border border-[#188B8B] checked:bg-[#188B8B] checked:border-[#188B8B]" />
            I have read and understood all the instructions and rules
          </label>
        </div>

        <button type="button" onClick={handleStart} disabled={!checked1 || !checked2 || sections.length === 0} className="w-full py-3 bg-[#f7cc82] font-semibold rounded-xl hover:bg-yellow-600 transition text-[#0F1729] font-inter disabled:opacity-50 disabled:cursor-not-allowed">
          Continue
        </button>
      </div>
    </div>
  );
}

export default function Pretest() {
  return <PretestContent />;
}
