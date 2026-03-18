import React, { useEffect, useMemo, useState } from "react";
import { Download, Percent, Plus, TrendingDown, TrendingUp, X } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../api/api";
import useAdminLiveData from "../../hooks/useAdminLiveData";
import { timeAgo } from "../../utils/adminFormat";
import { downloadCsv, openPrintPdf } from "../../utils/adminExport";
import PasswordField from "../../components/PasswordField";

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-600",
    "In Progress": "bg-orange-50 text-orange-600",
    Submitted: "bg-blue-50 text-blue-600",
    Scored: "bg-slate-100 text-slate-600",
    "In Review": "bg-amber-50 text-amber-600",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const initialUserForm = {
  name: "",
  email: "",
  password: "",
  mobile: "",
  subscription: "Basic",
  role: "user",
};

const initialCouponForm = {
  code: "",
  value: "",
  discountType: "percentage",
  validUntil: "",
  maxUses: "",
  note: "",
};

const AdminDashboard = () => {
  const { data, loading, error, refetch } = useAdminLiveData(5000);
  const [modal, setModal] = useState("");
  const [userForm, setUserForm] = useState(initialUserForm);
  const [couponForm, setCouponForm] = useState(initialCouponForm);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [clearingLogs, setClearingLogs] = useState(false);
  const [selectedLogIds, setSelectedLogIds] = useState([]);

  const growthData = useMemo(
    () => (data.analytics?.monthlySeries || []).map((row) => ({ name: row.name, value: row.userGrowth || 0 })),
    [data.analytics]
  );
  const revenueData = useMemo(
    () => (data.analytics?.monthlySeries || []).map((row) => ({ name: row.name, value: row.revenue || 0 })),
    [data.analytics]
  );

  const kpiData = [
    { title: "Total Users", value: data.kpis.totalUsers || 0, change: "Live", trend: "up" },
    { title: "Tests Purchased", value: data.kpis.testsPurchased || 0, change: "Live", trend: "up" },
    { title: "Completed Tests", value: data.kpis.completedTests || 0, change: "Live", trend: "up" },
    { title: "Revenue", value: data.kpis.revenueLabel || "₹0", change: "Live", trend: "up" },
  ];

  const closeModal = () => {
    setModal("");
    setActionError("");
    setActionLoading(false);
  };

  useEffect(() => {
    const validIds = new Set((data.recentActivity || []).map((row) => row.id));
    setSelectedLogIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [data.recentActivity]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");
    try {
      await api.post("/v1/admin/users", userForm);
      setUserForm(initialUserForm);
      closeModal();
      refetch();
    } catch (err) {
      setActionError(err?.response?.data?.msg || "Failed to create user");
      setActionLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");
    try {
      await api.post("/v1/admin/coupons", {
        ...couponForm,
        value: Number(couponForm.value),
        maxUses: couponForm.maxUses ? Number(couponForm.maxUses) : null,
      });
      setCouponForm(initialCouponForm);
      closeModal();
    } catch (err) {
      setActionError(err?.response?.data?.msg || "Failed to create coupon");
      setActionLoading(false);
    }
  };

  const handleExportReports = () => {
    const rows = [
      ["Type", "Name", "Email", "Status", "Date"],
      ...data.users.map((user) => ["User", user.name, user.email, user.status, user.createdAt || ""]),
      ...data.payments.map((payment) => ["Payment", payment.name, payment.email, payment.status, payment.date || ""]),
      ...data.submissions.map((submission) => ["Submission", submission.name, submission.email, submission.status, submission.date || ""]),
    ];
    downloadCsv("service-report.csv", rows);
    openPrintPdf("Jumpstart Service Report", [
      {
        title: "Users",
        headers: ["Name", "Email", "Subscription", "Status"],
        rows: data.users.map((user) => [user.name, user.email, user.subscription, user.status]),
      },
      {
        title: "Payments",
        headers: ["User", "Package", "Amount", "Status"],
        rows: data.payments.map((payment) => [payment.name, payment.package, payment.amountLabel, payment.status]),
      },
    ]);
  };

  const handleClearActivityLogs = async () => {
    if (clearingLogs || data.recentActivity.length === 0) return;

    const confirmed = window.confirm("Clear all activity logs from the admin dashboard?");
    if (!confirmed) return;

    setClearingLogs(true);
    setActionError("");
    try {
      await api.delete("/v1/admin/activity-logs");
      await refetch();
    } catch (err) {
      setActionError(err?.response?.data?.msg || "Failed to clear activity logs");
    } finally {
      setClearingLogs(false);
    }
  };

  const handleToggleLog = (id) => {
    setSelectedLogIds((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  };

  const handleToggleAllLogs = () => {
    const allIds = (data.recentActivity || []).map((row) => row.id);
    setSelectedLogIds((prev) => (prev.length === allIds.length ? [] : allIds));
  };

  const handleDeleteSelectedLogs = async () => {
    if (clearingLogs || selectedLogIds.length === 0) return;

    const confirmed = window.confirm(`Delete ${selectedLogIds.length} selected activity log(s)?`);
    if (!confirmed) return;

    setClearingLogs(true);
    setActionError("");
    try {
      const logs = (data.recentActivity || [])
        .filter((row) => selectedLogIds.includes(row.id))
        .map((row) => ({
          userId: row.userId,
          date: row.date,
        }));

      await api.post("/v1/admin/activity-logs/delete-selected", { logs });
      setSelectedLogIds([]);
      await refetch();
    } catch (err) {
      setActionError(err?.response?.data?.msg || "Failed to delete selected activity logs");
    } finally {
      setClearingLogs(false);
    }
  };

  const allActivityIds = (data.recentActivity || []).map((row) => row.id);
  const allLogsSelected = allActivityIds.length > 0 && selectedLogIds.length === allActivityIds.length;

  return (
    <main className="p-6 md:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Auto-refreshing every 5 seconds</p>
        {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((item) => (
          <div key={item.title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
            <p className="text-sm text-gray-400 uppercase tracking-wide">{item.title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{item.value}</h3>
            <div className="flex items-center gap-1 mt-3">
              {item.trend === "up" ? (
                <TrendingUp size={16} className="text-emerald-500" />
              ) : (
                <TrendingDown size={16} className="text-red-500" />
              )}
              <span className="text-sm font-semibold text-emerald-500">{item.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
          <h3 className="text-lg font-bold mb-4">User Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
          <h3 className="text-lg font-bold mb-4">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#14b8a6" fill="url(#revenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="p-6 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Recent Activity</h3>
            {actionError && <p className="text-xs text-rose-500 mt-1">{actionError}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDeleteSelectedLogs}
              disabled={clearingLogs || selectedLogIds.length === 0}
              className="inline-flex items-center justify-center rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
            >
              {clearingLogs && selectedLogIds.length > 0 ? "Deleting..." : `Delete Selected${selectedLogIds.length ? ` (${selectedLogIds.length})` : ""}`}
            </button>
            <button
              type="button"
              onClick={handleClearActivityLogs}
              disabled={clearingLogs || data.recentActivity.length === 0}
              className="inline-flex items-center justify-center rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
            >
              {clearingLogs && selectedLogIds.length === 0 ? "Clearing..." : "Clear All Logs"}
            </button>
          </div>
        </div>
        <div className="space-y-3 p-4 sm:hidden">
          {loading ? (
            <div className="rounded-2xl border border-gray-100 px-4 py-6 text-center text-gray-400">Loading...</div>
          ) : data.recentActivity.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 px-4 py-6 text-center text-gray-400">No activity yet</div>
          ) : (
            data.recentActivity.map((row) => (
              <div key={row.id} className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedLogIds.includes(row.id)}
                    onChange={() => handleToggleLog(row.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#14b8a6] focus:ring-[#14b8a6]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900 break-words">{row.user}</p>
                      <StatusBadge status={row.status} />
                    </div>
                    <p className="mt-2 text-sm text-gray-700 break-words">{row.action}</p>
                    <p className="mt-2 text-xs text-gray-400">{timeAgo(row.date)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <table className="hidden w-full text-sm sm:table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-400 uppercase">
                <input
                  type="checkbox"
                  checked={allLogsSelected}
                  onChange={handleToggleAllLogs}
                  className="h-4 w-4 rounded border-gray-300 text-[#14b8a6] focus:ring-[#14b8a6]"
                />
              </th>
              <th className="px-6 py-3 text-left text-gray-400 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-gray-400 uppercase">User</th>
              <th className="px-6 py-3 text-left text-gray-400 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-gray-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-gray-400">Loading...</td>
              </tr>
            ) : data.recentActivity.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-gray-400">No activity yet</td>
              </tr>
            ) : (
              data.recentActivity.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLogIds.includes(row.id)}
                      onChange={() => handleToggleLog(row.id)}
                      className="h-4 w-4 rounded border-gray-300 text-[#14b8a6] focus:ring-[#14b8a6]"
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-500">{timeAgo(row.date)}</td>
                  <td className="px-6 py-4 font-semibold">{row.user}</td>
                  <td className="px-6 py-4">{row.action}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setModal("user")}
            className="flex items-center gap-2 bg-[#f59e0b] text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            <Plus size={18} /> Add User
          </button>
          <button
            onClick={() => setModal("coupon")}
            className="flex items-center gap-2 border border-[#14b8a6] text-[#14b8a6] px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            <Percent size={18} /> Create Coupon
          </button>
          <button
            onClick={handleExportReports}
            className="flex items-center gap-2 border border-[#14b8a6] text-[#14b8a6] px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            <Download size={18} /> Export Reports
          </button>
        </div>
      </div>

      {modal === "user" && (
        <Modal title="Add User" onClose={closeModal}>
          <form className="space-y-4" onSubmit={handleCreateUser}>
            <input
              className="w-full border border-slate-200 rounded-2xl px-4 py-3"
              placeholder="Full name"
              value={userForm.name}
              onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <input
              className="w-full border border-slate-200 rounded-2xl px-4 py-3"
              type="email"
              placeholder="Email"
              value={userForm.email}
              onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
            <PasswordField
              value={userForm.password}
              onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Temporary password"
              inputClassName="w-full border border-slate-200 rounded-2xl px-4 py-3 pr-12"
              required
              autoComplete="new-password"
            />
            <input
              className="w-full border border-slate-200 rounded-2xl px-4 py-3"
              placeholder="Mobile"
              value={userForm.mobile}
              onChange={(e) => setUserForm((prev) => ({ ...prev, mobile: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                className="w-full border border-slate-200 rounded-2xl px-4 py-3"
                value={userForm.subscription}
                onChange={(e) => setUserForm((prev) => ({ ...prev, subscription: e.target.value }))}
              >
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
              <select
                className="w-full border border-slate-200 rounded-2xl px-4 py-3"
                value={userForm.role}
                onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {actionError && <p className="text-sm text-rose-500">{actionError}</p>}
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full rounded-2xl bg-slate-900 text-white py-3 font-semibold disabled:opacity-60"
            >
              {actionLoading ? "Creating..." : "Create User"}
            </button>
          </form>
        </Modal>
      )}

      {modal === "coupon" && (
        <Modal title="Create Coupon" onClose={closeModal}>
          <form className="space-y-4" onSubmit={handleCreateCoupon}>
            <input
              className="w-full border border-slate-200 rounded-2xl px-4 py-3"
              placeholder="Coupon code"
              value={couponForm.code}
              onChange={(e) => setCouponForm((prev) => ({ ...prev, code: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                className="w-full border border-slate-200 rounded-2xl px-4 py-3"
                value={couponForm.discountType}
                onChange={(e) => setCouponForm((prev) => ({ ...prev, discountType: e.target.value }))}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
              <input
                className="w-full border border-slate-200 rounded-2xl px-4 py-3"
                type="number"
                min="1"
                placeholder="Value"
                value={couponForm.value}
                onChange={(e) => setCouponForm((prev) => ({ ...prev, value: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                className="w-full border border-slate-200 rounded-2xl px-4 py-3"
                type="date"
                value={couponForm.validUntil}
                onChange={(e) => setCouponForm((prev) => ({ ...prev, validUntil: e.target.value }))}
              />
              <input
                className="w-full border border-slate-200 rounded-2xl px-4 py-3"
                type="number"
                min="1"
                placeholder="Max uses"
                value={couponForm.maxUses}
                onChange={(e) => setCouponForm((prev) => ({ ...prev, maxUses: e.target.value }))}
              />
            </div>
            <textarea
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 min-h-28"
              placeholder="Internal note"
              value={couponForm.note}
              onChange={(e) => setCouponForm((prev) => ({ ...prev, note: e.target.value }))}
            />
            {actionError && <p className="text-sm text-rose-500">{actionError}</p>}
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full rounded-2xl bg-slate-900 text-white py-3 font-semibold disabled:opacity-60"
            >
              {actionLoading ? "Saving..." : "Create Coupon"}
            </button>
          </form>
        </Modal>
      )}
    </main>
  );
};

export default AdminDashboard;
