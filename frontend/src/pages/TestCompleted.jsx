import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { SECTIONS } from "../data/livetestQuestions";

const QUESTIONS_PER_SECTION = 30;

const TestCompleted = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmitFinal = () => {
    setShowPopup(true);
  };

  const handleGoToDashboard = () => {
    setShowPopup(false);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="text-3xl font-bold text-[#0F1729]">Test Completed</h1>
        <p className="text-[#65758B] mt-1 text-base">You're almost done, submit your answers.</p>

        {/* Four section cards */}
        <div className="mt-8 space-y-4">
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-xl border border-[#E1E7EF] shadow-sm p-5 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <h3 className="text-lg font-semibold text-[#0F1729]">{section.title}</h3>
                <p className="text-sm text-[#65758B] mt-1">
                  Questions : {QUESTIONS_PER_SECTION}/{QUESTIONS_PER_SECTION}
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                Auto Saved
              </span>
            </div>
          ))}
        </div>

        {/* What happens next? */}
        <div className="mt-8 bg-[#e0f2f2] border border-teal-100 rounded-xl p-5">
          <h3 className="font-semibold text-[#0F1729] text-base mb-2">What happens next?</h3>
          <p className="text-sm text-[#65758B] leading-relaxed">
            Your test will be reviewed by our evaluation team. Results will be shared within 3–5 business days. You will receive an email notification when your results are ready.
          </p>
        </div>

        {/* Submission Confirmation */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-[#E1E7EF]">
          <div>
            <h3 className="font-semibold text-[#0F1729]">Submission Confirmation</h3>
            <p className="text-sm text-[#65758B] mt-1">
              Once you submit, your answers will be locked and cannot be changed.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSubmitFinal}
            className="shrink-0 px-6 py-3 bg-[#188B8B] text-white font-semibold rounded-xl hover:bg-teal-700 transition"
          >
            Submit Final Answers
          </button>
        </div>
      </div>

      {/* Blur overlay + Congratulations popup */}
      {showPopup &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowPopup(false)}
          >
            <div
              className="bg-[#0f766e] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition z-10"
                aria-label="Close"
              >
                <X size={24} />
              </button>

              <div className="p-8 pt-12 text-center">
                {/* Illustration placeholder - upward trend / achievement */}
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-14 h-14 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">Congratulations!</h2>
                <p className="!text-white text-sm leading-relaxed mb-8">
                  You are one step closer to Jumpstarting your educational journey. Stay tuned for your Career and Aptitude Report.
                </p>

                <button
                  type="button"
                  onClick={handleGoToDashboard}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-[#0F1729] font-semibold rounded-xl transition"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default TestCompleted;
