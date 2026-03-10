import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OverlayIcon from "../assets/Overlay.svg";
import CoffeeIcon from "../assets/coffe.svg";
import ClockIcon from "../assets/clock.svg";

const SectionBreak = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const completedSection = state.completedSection;
  const completedSectionIndex = state.completedSectionIndex || 0;
  const totalSections = state.totalSections || 0;
  const questionsSoFar = state.questionsSoFar ?? 0;
  const totalQuestions = state.totalQuestions ?? 0;
  const timeElapsedMinutes = state.timeElapsedMinutes ?? 0;
  const remainingSections = state.remainingSections || [];
  const remainingTitles = remainingSections.map((s) => s.name);

  const isSectionBreak = !!completedSection && remainingSections.length > 0;

  if (!isSectionBreak) {
    navigate("/Pretest", { replace: true });
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[#65758B]">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="w-full bg-white border-b border-[#E1E7EF]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-sm text-gray-400">Section Break</p>
          <h4 className="text-xl font-bold text-[#0F1729]">Section Break</h4>
        </div>
      </div>

      <div className="flex justify-center px-4 py-12">
        <div className="w-full max-w-2xl text-center">
          <div className="flex justify-center mb-5"><img src={OverlayIcon} alt="Completed" /></div>

          <h2 className="text-4xl font-bold text-[#0F1729]">{completedSection} Complete!</h2>
          <p className="text-slate-500 mt-2">Now choose any section you want to attempt next.</p>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-8 p-6 text-left">
            <h3 className="text-2xl text-[#0F1729] font-semibold mb-5">Your Progress</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-[#E1E7EF] pb-3">
                <span className="text-[#65758B] font-inter text-base">Completed Sections</span>
                <span className="text-[#0F1729] font-inter text-base font-semibold">{completedSectionIndex} of {totalSections}</span>
              </div>
              <div className="flex justify-between border-b border-[#E1E7EF] pb-3">
                <span className="text-[#65758B] font-inter text-base">Questions Answered</span>
                <span className="text-[#0F1729] font-inter text-base font-semibold">{questionsSoFar} of {totalQuestions}</span>
              </div>
              <div className="flex justify-between border-b border-[#E1E7EF] pb-3">
                <span className="text-[#65758B] font-inter text-base">Time Elapsed</span>
                <span className="text-[#0F1729] font-inter text-base font-semibold">{timeElapsedMinutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65758B] font-inter text-base">Remaining Sections</span>
                <span className="text-[#0F1729] font-inter text-base font-semibold text-right">{remainingTitles.join(", ")}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#ebf9f9] border border-teal-100 rounded-xl p-5 mt-6 flex gap-3 text-left">
            <img src={CoffeeIcon} alt="Break" className="w-5 h-5 mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold text-[#0F1729] text-base">Take a Break</h4>
              <p className="text-sm text-[#65758B] mt-1">Your progress is saved. Pick any remaining section when you're ready.</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {remainingSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => navigate(`/livetest/${section.id}`, { replace: true })}
                className="w-full bg-[#F59F0A] hover:bg-[#D97706] text-sm font-inter text-[#0F1729] font-semibold py-3 rounded-lg transition"
              >
                Continue to {section.name}
              </button>
            ))}
          </div>

          <div className="flex justify-center items-center gap-2 text-sm text-[#65758B] mt-4 font-inter">
            <img src={ClockIcon} alt="Time" className="w-4 h-4" />
            <span>Pick any section above to continue</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionBreak;
