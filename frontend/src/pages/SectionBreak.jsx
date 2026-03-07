import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OverlayIcon from "../assets/Overlay.svg";
import CoffeeIcon from "../assets/coffe.svg";
import ClockIcon from "../assets/clock.svg";
import { SECTIONS, getRemainingSectionsAfter, TOTAL_QUESTIONS, TOTAL_SECTIONS } from "../data/livetestQuestions";

const SectionBreak = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const completedSection = state.completedSection;
  const questionsSoFar = state.questionsSoFar ?? 0;
  const timeElapsedMinutes = state.timeElapsedMinutes ?? 0;
  const nextSectionId = state.nextSectionId;

  const isSectionBreak = typeof completedSection === "number" && completedSection >= 1 && completedSection <= 3;
  const remainingTitles = completedSection ? getRemainingSectionsAfter(completedSection) : [];
  const nextSection = nextSectionId ? SECTIONS.find((s) => s.id === nextSectionId) : null;
  const estimatedNextMinutes = nextSection?.durationMinutes ?? 20;

  if (state.testComplete) {
    navigate("/test-completed", { replace: true });
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[#65758B]">Redirecting...</p>
      </div>
    );
  }

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
          <div className="flex justify-center mb-5">
            <img src={OverlayIcon} alt="Completed" />
          </div>

          <h2 className="text-4xl font-bold text-[#0F1729]">Section {completedSection} Complete!</h2>
          <p className="text-slate-500 mt-2">Great progress! Take a short break before continuing.</p>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-8 p-6 text-left">
            <h3 className="text-2xl text-[#0F1729] font-semibold mb-5">Your Progress</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-[#E1E7EF] pb-3">
                <span className="text-[#65758B] font-inter text-base">Completed Sections</span>
                <span className="text-[#0F1729] font-inter text-base font-semibold">{completedSection} of {TOTAL_SECTIONS}</span>
              </div>
              <div className="flex justify-between border-b border-[#E1E7EF] pb-3">
                <span className="text-[#65758B] font-inter text-base">Questions Answered</span>
                <span className="text-[#0F1729] font-inter text-base font-semibold">{questionsSoFar} of {TOTAL_QUESTIONS}</span>
              </div>
              <div className="flex justify-between border-b border-[#E1E7EF] pb-3">
                <span className="text-[#65758B] font-inter text-base">Time Elapsed</span>
                <span className="text-[#0F1729] font-inter text-base font-semibold">{timeElapsedMinutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65758B] font-inter text-base">Remaining Sections</span>
                <span className="text-[#0F1729] font-inter text-base font-semibold text-right">
                  {remainingTitles.length ? remainingTitles.join(", ") : "None"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#ebf9f9] border border-teal-100 rounded-xl p-5 mt-6 flex gap-3 text-left">
            <img src={CoffeeIcon} alt="Break" className="w-5 h-5 mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold text-[#0F1729] text-base">Take a Break</h4>
              <p className="text-sm text-[#65758B] mt-1">
                You can take a short 5-minute break. Your progress is saved. When you're ready, click continue to start the next section.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/livetest/${nextSectionId}`, { replace: true })}
            className="w-full mt-6 bg-[#F59F0A] hover:bg-[#D97706] text-sm font-inter text-[#0F1729] font-semibold py-3 rounded-lg transition"
          >
            Continue to Next Section
          </button>

          <div className="flex justify-center items-center gap-2 text-sm text-[#65758B] mt-4 font-inter">
            <img src={ClockIcon} alt="Time" className="w-4 h-4" />
            <span>Estimated time for next section: {estimatedNextMinutes} minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionBreak;
