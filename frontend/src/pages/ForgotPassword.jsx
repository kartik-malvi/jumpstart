import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/api";

export default function ForgotPassword() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/service");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const backHref = isAdmin ? "/service/login" : "/login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setDevResetUrl("");
    try {
      const res = await api.post("/v1/user/auth/forgot-password", { email, isAdmin });
      setMessage(res?.data?.msg || "If this email exists, a reset link has been sent.");
      if (res?.data?.devResetUrl) setDevResetUrl(res.data.devResetUrl);
    } catch (err) {
      setError(err?.response?.data?.msg || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#0F1729]">{isAdmin ? "Admin forgot password" : "Forgot password"}</h1>
        <p className="mt-2 text-sm text-[#65758B]">Enter your email and we will send a reset link.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-400"
            required
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {message && <p className="text-sm text-emerald-700">{message}</p>}
          {devResetUrl && (
            <p className="text-sm text-amber-700 break-all">
              Dev reset link: <a href={devResetUrl} className="underline">{devResetUrl}</a>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#188B8B] py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <Link to={backHref} className="block mt-5 text-sm font-medium text-[#188B8B] hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
