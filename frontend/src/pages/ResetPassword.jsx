import React, { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import PasswordField from "../components/PasswordField";

export default function ResetPassword() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith("/service");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const backHref = isAdmin ? "/service/login" : "/login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await api.post(`/v1/user/auth/reset-password/${token}`, {
        password,
        password_confirmation: confirmPassword,
      });
      setMessage(res?.data?.msg || "Password updated successfully");
      setTimeout(() => navigate(backHref), 1000);
    } catch (err) {
      setError(err?.response?.data?.msg || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#0F1729]">Set new password</h1>
        <p className="mt-2 text-sm text-[#65758B]">Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <PasswordField
            label="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            labelClassName="block text-sm mb-2 font-medium"
            inputClassName="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:border-teal-400"
            required
            minLength={6}
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            labelClassName="block text-sm mb-2 font-medium"
            inputClassName="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:border-teal-400"
            required
            minLength={6}
            autoComplete="new-password"
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {message && <p className="text-sm text-emerald-700">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#188B8B] py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <Link to={backHref} className="block mt-5 text-sm font-medium text-[#188B8B] hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
