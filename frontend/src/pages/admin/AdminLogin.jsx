import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user?.role === "admin") {
    return <Navigate to="/service/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      const nextUser = response?.data?.user;
      if (nextUser?.role !== "admin") {
        throw new Error("This account does not have service access");
      }
      navigate("/service/dashboard");
    } catch (err) {
      setError(err.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-400/20 text-teal-300 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-200/80">Service</p>
            <h1 className="text-2xl font-bold">Admin Access</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-white/80">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 outline-none focus:border-teal-300"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-white/80">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 outline-none focus:border-teal-300"
              placeholder="Enter password"
              required
            />
          </div>

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-teal-400 text-slate-950 font-bold py-3 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Open Service Dashboard"}
          </button>
        </form>

        <p className="text-sm text-white/60 mt-6">
          Password reset is available inside Service Settings after login, or another admin can reset a user password from User Management.
        </p>
      </div>
    </div>
  );
}
