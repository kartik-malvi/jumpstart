import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { HiBadgeCheck } from "react-icons/hi";
import { usePackageData } from "../context/PackageContext";
import DEFAULT_PACKAGE from "../utils/testPackageStore";

const parseAmount = (price = "") => {
  const n = Number(String(price).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const Test = () => {
  const { packages, setSelectedPackageId } = usePackageData();
  const navigate = useNavigate();

  const plans = useMemo(() => {
    const source = packages.length ? packages : [DEFAULT_PACKAGE];
    return source.map((plan, i) => ({
      ...plan,
      id: plan._id || plan.id || `plan-${i + 1}`,
      badge: i === 0 ? "Most Popular" : "Featured",
      badgeBg: i === 0 ? "bg-[#E6F8F8]" : "bg-[#FEF2D6]",
      badgeText: i === 0 ? "text-[#0B908E]" : "text-[#B98500]",
      border: i === 0 ? "border-[#E4E7EC]" : "border-[#F8A300]",
      amount: parseAmount(plan.priceLabel || plan.price || plan.displayPrice),
      title: plan.name,
      features: plan.features
        ? [plan.features]
        : [`${(plan.sections || []).length} sections configured`],
      button: i % 2 === 0 ? "bg-[#0B908E]" : "bg-[#F8A300]",
      text: "Get Started",
      duration: `Total duration: ~${(plan.sections || []).reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0)} minutes`,
      checkColor: i % 2 === 0 ? "text-[#0B908E]" : "text-[#F8A300]",
      strike: plan.oldPrice || "",
    }));
  }, [packages]);

  const handleGetStarted = (plan) => {
    setSelectedPackageId(plan._id || plan.id, plan);
    navigate("/payment", { state: { plan } });
  };

  return (
    <section className="py-20 bg-[#F8FAFA] font-[Poppins]">
      <div className="text-center mb-4">
        <span className="text-[#0B908E] text-xs font-medium px-4 py-1 bg-[#E8F9F8] rounded-full">Choose Your Package</span>
      </div>

      <h2 className="text-4xl font-semibold text-[#0B0C0E] text-center">Career Aptitude Test Packages</h2>
      <p className="text-gray-500 text-center mt-3 max-w-xl mx-auto text-sm">Packages are loaded dynamically from Admin Settings</p>

      <div className={`max-w-7xl mx-auto px-6 md:px-8 mt-14 grid grid-cols-1 ${plans.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-1"} gap-8 items-stretch`}>
        {plans.map((plan, i) => (
          <div key={plan.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 ${plan.border} flex flex-col h-full p-8`}>
            <div className={`w-fit px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${plan.badgeBg} ${plan.badgeText}`}>
              <HiBadgeCheck />
              {plan.badge}
            </div>

            <h3 className="text-2xl font-semibold text-[#0B0C0E] mt-4">{plan.title}</h3>
            <p className="text-gray-500 text-sm mt-1">{plan.sections?.length || 0} section(s) configured in admin</p>

            <div className="mt-6">
              <div className="flex items-end gap-2">
                <p className="!text-3xl !font-bold !text-[#0B0C0E]">{plan.price}</p>
                {plan.strike && <span className="text-gray-400 line-through">{plan.strike}</span>}
              </div>
              <p className="text-gray-500 text-sm mt-1">One-time payment</p>
            </div>

            <ul className="mt-6 space-y-3 flex-1">
              {plan.features.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                  <FaCheck className={`${plan.checkColor} text-xs mt-1`} />
                  {item}
                </li>
              ))}
            </ul>

            <button type="button" onClick={() => handleGetStarted(plan)} className={`${plan.button} w-full text-white py-3 rounded-full mt-7 font-medium hover:opacity-90 transition`}>
              {plan.text}
            </button>

            <p className="text-gray-500 text-xs text-center mt-3">{plan.duration}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Test;
