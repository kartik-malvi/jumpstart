import React, { useState } from 'react';
import upiIcon from "../assets/upi.svg";
import creditIcon from "../assets/credit.svg";
import netIcon from "../assets/net.svg";
import walletIcon from "../assets/wallet.svg";
import secure from "../assets/secure.svg";
import lck from "../assets/lck.svg";

const Payment = () => {
  const [method, setMethod] = useState("upi");
  const [agree, setAgree] = useState(false);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F1729]">
            Complete Your Payment
          </h2>
          <p className="!text-base text-[#65758B] mt-1">
            Secure checkout powered by industry‑standard encryption
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-8">
            {/* Billing Information */}
            <div className="bg-white rounded-2xl p-8 border border-[#E6ECF5]">
              <h3 className="text-2xl text-[#0F1729] font-semibold">
                Billing Information
              </h3>
              <p className="!text-sm text-[#65758B] mt-1 mb-8">
                Enter your billing details
              </p>

              <div className="space-y-5 font-inter">
                <div>
                  <label className="block text-sm font-medium text-[#0F1729] mb-2">
                    Full Name *
                  </label>
                  <input
                    className="w-full h-[46px] rounded-[14px] border border-[#E1E7EF] bg-[#FAFAFA] px-4 text-sm outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F1729] mb-2">
                    Email Address *
                  </label>
                  <input
                    className="w-full h-[46px] rounded-[14px] border border-[#E1E7EF] bg-[#FAFAFA] px-4 text-sm outline-none"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F1729] mb-2">
                    Phone Number *
                  </label>
                  <input
                    className="w-full h-[46px] rounded-[14px] border border-[#E1E7EF] bg-[#FAFAFA] px-4 text-sm outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F1729] mb-2">
                    Address
                  </label>
                  <input
                    className="w-full h-[46px] rounded-[14px] border border-[#E1E7EF] bg-[#FAFAFA] px-4 text-sm outline-none"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[#0F1729] mb-2">
                      City
                    </label>
                    <input
                      className="w-full h-[46px] rounded-[14px] border border-[#E1E7EF] bg-[#FAFAFA] px-4 text-sm outline-none"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F1729] mb-2">
                      Pincode
                    </label>
                    <input
                      className="w-full h-[46px] rounded-[14px] border border-[#E1E7EF] bg-[#FAFAFA] px-4 text-sm outline-none"
                      placeholder="400001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F1729] mb-2">
                    GST Number (Optional)
                  </label>
                  <input
                    className="w-full h-[46px] rounded-[14px] border border-[#E1E7EF] bg-[#FAFAFA] px-4 text-sm outline-none"
                    placeholder="22AAAA0000A1Z5"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-8 border border-[#E6ECF5]">
              <h3 className="text-2xl text-[#0F1729] font-semibold">
                Select Payment Method
              </h3>
              <p className="!text-sm text-[#65758B] mt-1 mb-8">
                Choose your preferred payment option
              </p>

              <div className="space-y-3">
                {[{ id: "upi", label: "UPI (PhonePe, Google Pay, Paytm)", icon: upiIcon },{ id: "card", label: "Credit / Debit Card", icon: creditIcon },{ id: "net", label: "Net Banking", icon: netIcon },{ id: "wallet", label: "Wallet", icon: walletIcon }].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMethod(item.id)}
                    className={`w-full h-[52px] rounded-2xl px-5 flex items-center gap-4 border transition text-sm ${
                      method === item.id
                        ? "border-teal-400 bg-teal-50"
                        : "border-[#E1E7EF] bg-white"
                    }`}
                  >
                    {/* Radio */}
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        method === item.id
                          ? "border-teal-600"
                          : "border-slate-300"
                      }`}
                    >
                      {method === item.id && (
                        <span className="w-2 h-2 rounded-full bg-teal-600" />
                      )}
                    </span>

                    {/* Icon */}
                    <img src={item.icon} alt="" className="w-5 h-5" />

                    {/* Label */}
                    <span className="text-[#0F1729] font-inter font-medium text-left">{item.label}</span>
                  </button>
                ))}
              </div>

              {method === "upi" && (
                <div className="mt-5">
                  <label className="block text-sm font-medium font-inter text-[#0F1729] mb-2">
                    UPI ID
                  </label>
                  <input
                    className="w-full h-[46px] rounded-[14px] border border-[#E1E7EF] bg-[#FAFAFA] px-4 text-sm outline-none"
                    placeholder="yourname@upi"
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="bg-white rounded-2xl p-8 border border-[#E6ECF5] h-fit">
            <h3 className="text-2xl text-[#0F1729] font-semibold">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm mt-2 font-inter" >
              <div className="flex justify-between">
                <span className="text-[#0F1729]">Premium Package</span>
                <span className="text-[#0F1729] text-base font-semibold">₹2,499</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span className="text[#65758B]">GST (18%)</span>
                <span>₹450</span>
              </div>
            </div>

            {/* Discount Code */}
            <div className="mt-6 mb-6 border-t border-[#E1E7EF] pt-4 font-inter">
              <label className="block text-sm font-medium text-[#0F1729] mb-2">
                Discount Code
              </label>
              <div className="flex gap-2">
                <input
                  className="w-[100%] h-[42px] rounded-[14px] border border-[#E1E7EF] bg-[#FAFAFA] px-4 text-sm outline-none"
                  placeholder="Enter code"
                />
                <button className="h-[42px] px-5 rounded-[14px] border-2 border-[#188B8B] text-[#188B8B] text-sm font-medium">
                  Apply
                </button>
              </div>
            </div>

            <div className="border-t border-[#E1E7EF] my-6" />

            <div className="flex justify-between items-center mb-6 font-inter">
              <span className="font-semibold text-[#0F1729]">Total Amount</span>
              <span className="text-2xl font-bold text-[#188B8B]">₹2,949</span>
            </div>

            <label className="grid auto-cols-auto grid-flow-col items-start gap-3 text-sm mb-6 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 appearance-none rounded-full border border-[#188B8B] checked:bg-[#188B8B] checked:border-[#188B8B] focus:outline-none relative"
              />
              <span className="text-[#0F1729]">
                I accept the <span className="text-[#188B8B]">Terms & Conditions</span> and{' '}
                <span className="text-[#188B8B]">Privacy Policy</span>
              </span>
            </label>

            <button
            
              disabled={!agree}
              
              className={`w-full h-[48px] rounded-xl font-semibold transition flex items-center justify-center gap-1 ${
                agree
                  ? "bg-[#F59F0A] text-[#0F1729]"
                  : "bg-[#facf84] text-[#0f172994] cursor-not-allowed"
              }`}
            >
              <img
                src={lck}
                alt="secure"
                className={`w-4 h-4 ${agree ? "" : "opacity-60"}`}
                style={{ filter: agree ? "none" : "grayscale(100%)" }}
              />
              Complete Payment
            </button>

            <p className="!text-xs text-slate-400 text-center mt-4 flex items-center justify-center gap-1">
              <img src={secure} alt="secure" className="w-4 h-4" />
              <span>100% Secure Payment • SSL Encrypted</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment
