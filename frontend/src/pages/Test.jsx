import React from "react";
import { FaCheck } from "react-icons/fa";
import { HiBadgeCheck } from "react-icons/hi"; // for badge icons

const Test = () => {
  const plans = [
    {
      badge: "Most Popular",
      badgeBg: "bg-[#E6F8F8]",
      badgeText: "text-[#0B908E]",
      border: "border-[#E4E7EC]",
      title: "Essential Package",
      price: "₹1499",
      strike: "",
      features: [
        "Personality Assessment",
        "Aptitude Test",
        "Basic career recommendations",
        "Detailed PDF report",
        "Email support",
      ],
      button: "bg-[#0B908E]",
      text: "Get Started",
      duration: "Total duration: ~180 minutes",
      checkColor: "text-[#0B908E]",
    },
    {
      badge: "Best Value",
      badgeBg: "bg-[#FEF2D6]",
      badgeText: "text-[#B98500]",
      border: "border-[#F8A300]",
      title: "Standard Package",
      price: "₹1,999",
      strike: "",
      features: [
        "Everything in Basic, plus:",
        "Advanced cognitive assessment",
        "Top 10 career matches with pathways",
        "Interactive dashboard",
      ],
      button: "bg-[#F8A300]",
      text: "Get Started",
      duration: "Total duration: ~180 minutes",
      checkColor: "text-[#F8A300]",
    },
    {
      badge: "Premium",
      badgeBg: "bg-[#E6F8F8]",
      badgeText: "text-[#0B908E]",
      border: "border-[#0B908E]",
      title: "Premium Package",
      price: "₹4,999",
      strike: "₹6,999",
      features: [
        "Everything in Standard, plus:",
        "Work values & culture fit analysis",
        "Personalized action plan",
        "3 counselling sessions (90 mins total)",
        "6-month follow-up support",
      ],
      button: "bg-[#0B908E]",
      text: "Get Started",
      duration: "Total duration: ~180 minutes + counselling",
      checkColor: "text-[#0B908E]",
    },
  ];

  return (
    <section className="py-20 bg-[#F8FAFA] font-[Poppins]">
      {/* Header */}
      <div className="text-center mb-4">
        <span className="text-[#0B908E] text-xs font-medium px-4 py-1 bg-[#E8F9F8] rounded-full">
          Choose Your Package
        </span>
      </div>

      <h2 className="text-4xl font-semibold text-[#0B0C0E] text-center">
        Career Aptitude Test Packages
      </h2>
      <p className="text-gray-500 text-center mt-3 max-w-xl mx-auto text-sm">
        Scientifically-designed assessments to discover your strengths, interests, and ideal career paths
      </p>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 ${plan.border} flex flex-col h-full p-8`}
          >
            <div className={`w-fit px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${plan.badgeBg} ${plan.badgeText}`}>
              <HiBadgeCheck />
              {plan.badge}
            </div>

            <h3 className="text-xl font-semibold text-[#0B0C0E] mt-4">
              {plan.title}
            </h3>

            {/* sub text */}
            <p className="text-gray-500 text-sm mt-1">
              {i === 0 && "Languages: English / Hindi / Gujarati"}
              {i === 1 && "Comprehensive assessment for serious career planning"}
              {i === 2 && "Best suited for Indian Students wanting to go for International Studies."}
            </p>

            {/* Price */}
            <div className="mt-6">
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-[#0B0C0E]">{plan.price}</p>
                {plan.strike && <span className="text-gray-400 line-through">{plan.strike}</span>}
              </div>
              <p className="text-gray-500 text-sm mt-1">One-time payment</p>
            </div>

            {/* Features */}
            <ul className="mt-6 space-y-3 flex-1">
              {plan.features.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                  <FaCheck className={`${plan.checkColor} text-xs mt-1`} />
                  {item}
                </li>
              ))}
            </ul>

            {/* Button */}
            <button
              className={`${plan.button} w-full text-white py-3 rounded-full mt-7 font-medium hover:opacity-90 transition`}
            >
              {plan.text}
            </button>

            <p className="text-gray-500 text-xs text-center mt-3">{plan.duration}</p>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="bg-[#DDF8F8] rounded-3xl py-10 px-10 mt-16 max-w-4xl mx-auto text-center">
        <h3 className="text-[#0B0C0E] font-semibold text-xl mb-6">
          All Packages Include
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 text-center">
          <div>
            <FaCheck className="text-[#0B908E] text-xl mx-auto" />
            <p className="font-semibold mt-2">Dashboard Access</p>
            <p className="text-gray-500 text-sm">Detailed breakup & direct link to results</p>
          </div>
          <div>
            <FaCheck className="text-[#0B908E] text-xl mx-auto" />
            <p className="font-semibold mt-2">Scientifically Valid</p>
            <p className="text-gray-500 text-sm">Tests created by professional psychologists</p>
          </div>
          <div>
            <FaCheck className="text-[#0B908E] text-xl mx-auto" />
            <p className="font-semibold mt-2">Lifetime Access</p>
            <p className="text-gray-500 text-sm">View your reports anytime</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Test;
