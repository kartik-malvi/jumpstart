import React from "react";
import { useNavigate } from "react-router-dom";
import { clearCompletedSectionIds, saveSelectedSectionIds } from "../utils/testPackageStore";
import { usePackageData } from "../context/PackageContext";

const ChooseSection = () => {
  const navigate = useNavigate();

  const { activePackage } = usePackageData();
  const sections = activePackage?.sections || [];
  const [firstSectionId, setFirstSectionId] = React.useState(sections[0]?.id || null);

  const startTest = () => {
    if (!firstSectionId) return;
    const allIds = sections.map((s) => s.id);
    saveSelectedSectionIds(allIds);
    clearCompletedSectionIds();
    navigate(`/livetest/${firstSectionId}`, { replace: true });
  };

  if (!sections.length) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center max-w-lg w-full">
          <h2 className="text-2xl font-bold text-[#0F1729]">No Sections Available</h2>
          <p className="text-[#65758B] mt-2">Please configure sections from Admin Settings first.</p>
          <button onClick={() => navigate("/pretest", { replace: true })} className="mt-5 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-[#0F1729]">Choose First Section</h1>
          <p className="text-[#65758B] mt-2">Select any section to start first. After that, you can choose any remaining section again.</p>

          <div className="mt-6 space-y-3">
            {sections.map((section) => {
              const active = String(firstSectionId) === String(section.id);
              return (
                <button
                  type="button"
                  key={section.id}
                  onClick={() => setFirstSectionId(section.id)}
                  className={`w-full text-left rounded-xl border px-4 py-4 transition ${active ? "border-teal-400 bg-teal-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                >
                  <p className="text-sm font-semibold text-[#0F1729]">{section.name}</p>
                  <p className="text-xs text-[#65758B] mt-1">{(section.questions || []).length} questions • {section.durationMinutes || 20} min</p>
                </button>
              );
            })}
          </div>

          <button onClick={startTest} className="w-full mt-6 py-3 bg-[#F59F0A] text-[#0F1729] font-semibold rounded-xl hover:bg-amber-500 transition">Start Test</button>
        </div>
      </div>
    </div>
  );
};

export default ChooseSection;
