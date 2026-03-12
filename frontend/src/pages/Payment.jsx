import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { X } from "lucide-react";
import upiIcon from "../assets/upi.svg";
import creditIcon from "../assets/credit.svg";
import netIcon from "../assets/net.svg";
import walletIcon from "../assets/wallet.svg";
import secure from "../assets/secure.svg";
import lck from "../assets/lck.svg";
import { GST_RATE } from "../data/testPackages";
import api from "../api/api";
import { usePackageData } from "../context/PackageContext";
import { saveSelectedPackageId } from "../utils/testPackageStore";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [method, setMethod] = useState("upi");
  const [agree, setAgree] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const { coupons } = usePackageData();

  const plan = location.state?.plan;

  useEffect(() => {
    if (!plan || !plan.id) {
      navigate("/test", { replace: true });
      return;
    }
    saveSelectedPackageId(plan._id || plan.id);
  }, [plan, navigate]);

  const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const subtotal = plan?.amount ?? 0;
  const discountAmount = appliedCoupon
    ? appliedCoupon.discount.endsWith("%")
      ? Math.round((subtotal * Number(appliedCoupon.discount.replace("%", ""))) / 100)
      : Math.round(Number(appliedCoupon.discount.replace(/[^\d]/g, "")) || 0)
    : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const gstAmount = Math.round(discountedSubtotal * GST_RATE);
  const total = discountedSubtotal + gstAmount;

  const paymentMethodLabel = {
    upi: "UPI",
    card: "Card",
    net: "Net Banking",
    wallet: "Wallet",
  };

  const handleCompletePayment = async () => {
    const orderId = `ORD-${Date.now()}`;
    try {
      await api.post("/v1/user/payment-complete", {
        orderId,
        packageName: plan.title,
        amount: total,
        method: paymentMethodLabel[method] || "UPI",
      });
    } catch (err) {
      console.error("Failed to save payment event:", err?.response?.data || err.message);
    }
    setShowSuccessPopup(true);
  };

  const handleCopyCoupon = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Enter a coupon code");
      setAppliedCoupon(null);
      return;
    }

    const found = (coupons || []).find((c) => c.code?.toUpperCase() === code);
    if (!found) {
      setCouponError("Invalid coupon code");
      setAppliedCoupon(null);
      return;
    }

    if (found.validUntil) {
      const expiry = new Date(found.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry < today) {
        setCouponError("This coupon has expired");
        setAppliedCoupon(null);
        return;
      }
    }

    if (found.maxUses && found.uses >= found.maxUses) {
      setCouponError("Coupon redemption limit reached");
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(found);
    setCouponError("");
  };

  const handleSuccessOk = () => {
    setShowSuccessPopup(false);
    navigate("/Pretest", { replace: true });
  };

  if (!plan || !plan.id) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[#65758B]">Redirecting to packages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-10">
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
                    type="button"
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

            <div className="space-y-3 text-sm mt-4 font-inter">
              <div className="flex justify-between">
                <span className="text-[#0F1729] font-medium">{plan.title}</span>
                <span className="text-[#0F1729] text-base font-semibold">{plan.price}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span className="text-[#65758B]">GST (18%)</span>
                <span>{formatPrice(gstAmount)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E1E7EF]">
              <p className="text-xs font-semibold text-[#0F1729] mb-2">Included in this package</p>
              <ul className="space-y-1.5 text-xs text-[#65758B]">
                {plan.features?.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <FaCheck className={`${plan.checkColor || "text-[#0B908E]"} mt-0.5 shrink-0`} />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-slate-400 mt-2">{plan.duration}</p>
            </div>

            {/* Discount Code */}
            <div className="mt-6 mb-6 border-t border-[#E1E7EF] pt-4 font-inter">
              <label className="block text-sm font-medium text-[#0F1729] mb-2">
                Discount Code
              </label>
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-[100%] h-[42px] rounded-[14px] border border-[#E1E7EF] bg-[#FAFAFA] px-4 text-sm outline-none"
                  placeholder="Enter code"
                />
                <button type="button" onClick={handleApplyCoupon} className="h-[42px] px-5 rounded-[14px] border-2 border-[#188B8B] text-[#188B8B] text-sm font-medium">
                  Apply
                </button>
              </div>
              {couponError && <p className="text-xs text-rose-500 mt-2">{couponError}</p>}
              {appliedCoupon && <p className="text-xs text-emerald-600 mt-2">Coupon applied successfully.</p>}
              {appliedCoupon && (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm">
                  <span className="text-[#0F766E] font-semibold">{appliedCoupon.code} ({appliedCoupon.discount})</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCoupon(appliedCoupon.code)}
                    className="text-[#0F766E] text-[11px] font-semibold uppercase tracking-wide"
                  >
                    Copy Code
                  </button>
                </div>
              )}
              {(coupons || []).length > 0 && (
                <div className="mt-4 text-xs text-[#65758B]">
                  <p className="font-semibold mb-2 text-xs text-[#0F1729]">Available coupon codes</p>
                  <div className="space-y-2">
                    {coupons.map((coupon) => (
                      <div key={coupon.id} className="flex items-center justify-between rounded-lg border border-[#E1E7EF] bg-[#F8FAFA] px-3 py-2">
                        <span className="text-[#0F1729] font-medium">
                          {coupon.code} • {coupon.discount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(coupon.code)}
                          className="text-[#188B8B] text-[11px] font-semibold uppercase tracking-wide"
                        >
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#E1E7EF] my-6" />

            <div className="flex justify-between items-center mb-6 font-inter">
              <span className="font-semibold text-[#0F1729]">Total Amount</span>
              <span className="text-2xl font-bold text-[#188B8B]">{formatPrice(total)}</span>
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
              type="button"
              disabled={!agree}
              onClick={handleCompletePayment}
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

      {/* Payment Success Popup - rendered in document.body so it always shows on top */}
      {showSuccessPopup &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/50"
            style={{ zIndex: 99999 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-success-title"
          >
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 text-center relative">
            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="absolute top-3 right-3 rounded-full p-1 text-gray-400 hover:text-gray-700"
            >
              <X size={18} />
            </button>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <FaCheck className="text-3xl text-emerald-600" />
              </div>
              <h3 id="payment-success-title" className="text-xl font-bold text-[#0F1729] mb-2">
                Payment Successful
              </h3>
              <p className="text-sm text-[#65758B] mb-6">Your payment has been processed successfully.</p>
              <button
                type="button"
                onClick={handleSuccessOk}
                className="w-full h-12 rounded-xl bg-[#188B8B] text-white font-semibold hover:bg-teal-700 transition"
              >
                Continue to Pretest
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default Payment
