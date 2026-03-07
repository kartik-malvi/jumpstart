import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { HiBadgeCheck } from "react-icons/hi";
import api from "../api/api";

const Test = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/v1/public/config")
      .then((res) => {
        const packages = res?.data?.data?.packages || [];
        setPlans(packages);
      })
      .catch((err) => {
        console.error("Failed to load packages", err);
        setPlans([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleGetStarted = (plan) => {
    navigate("/payment", { state: { plan } });
  };

  if (loading) {
    return (
      <section className="py-20 bg-[#F8FAFA] font-[Poppins] text-center">
        <p className="text-gray-500">Loading packages...</p>
      </section>
    );
  }

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
      <div className={`max-w-7xl mx-auto px-6 md:px-8 mt-14 grid grid-cols-1 ${plans.length > 1 ? "md:grid-cols-3" : "md:grid-cols-1"} gap-8 items-stretch`}>
        {plans.map((plan, i) => (
          <div
            key={plan.id || i}
            className="bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 border-[#E4E7EC] flex flex-col h-full p-8"
          >
            <div className="w-fit px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 bg-[#E6F8F8] text-[#0B908E]">
              <HiBadgeCheck />
              {plan.badge || "Recommended"}
            </div>

            <h3 className="text-2xl font-semibold text-[#0B0C0E] mt-4">
              {plan.title}
            </h3>

            {/* sub text */}
            <p className="text-gray-500 text-sm mt-1">Dynamic package from admin settings</p>

            {/* Price */}
            <div className="mt-6">
              <div className="flex items-end gap-2">
                <p className="!text-3xl !font-bold !text-[#0B0C0E]">₹{Number(plan.amount || 0).toLocaleString("en-IN")}</p>
                {plan.strikeAmount ? <span className="text-gray-400 line-through">₹{Number(plan.strikeAmount).toLocaleString("en-IN")}</span> : null}
              </div>
              <p className="text-gray-500 text-sm mt-1">One-time payment</p>
            </div>

            {/* Features */}
            <ul className="mt-6 space-y-3 flex-1">
              {plan.features.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                  <FaCheck className="text-[#0B908E] text-xs mt-1" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Button */}
            <button
              type="button"
              onClick={() => handleGetStarted(plan)}
              className="bg-[#0B908E] w-full text-white py-3 rounded-full mt-7 font-medium hover:opacity-90 transition"
            >
              Get Started
            </button>

            <p className="text-gray-500 text-xs text-center mt-3">{plan.durationText || "Total duration depends on selected sections"}</p>
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
