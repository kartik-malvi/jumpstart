import React from "react";
import { TrendingUp, TrendingDown, Plus, Percent, Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import useAdminLiveData from "../../hooks/useAdminLiveData";
import { timeAgo } from "../../utils/adminFormat";

const growthData = [
  { name: "May", value: 420 },
  { name: "Jun", value: 580 },
  { name: "Jul", value: 720 },
  { name: "Aug", value: 900 },
  { name: "Sep", value: 1100 },
  { name: "Oct", value: 1450 },
];

const revenueData = [
  { name: "May", value: 140000 },
  { name: "Jun", value: 180000 },
  { name: "Jul", value: 210000 },
  { name: "Aug", value: 240000 },
  { name: "Sep", value: 275000 },
  { name: "Oct", value: 300000 },
];

const StatusBadge = ({ status }) => {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-600",
    "In Progress": "bg-orange-50 text-orange-600",
    Submitted: "bg-blue-50 text-blue-600",
    Scored: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const AdminDashboard = () => {
  const { data, loading, error } = useAdminLiveData(5000);

  const kpiData = [
    { title: "Total Users", value: data.kpis.totalUsers || 0, change: "Live", trend: "up" },
    { title: "Tests Purchased", value: data.kpis.testsPurchased || 0, change: "Live", trend: "up" },
    { title: "Completed Tests", value: data.kpis.completedTests || 0, change: "Live", trend: "up" },
    { title: "Revenue", value: data.kpis.revenueLabel || "₹0", change: "Live", trend: "up" },
  ];

  return (
    <main className="p-6 md:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Auto-refreshing every 5 seconds</p>
        {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
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
                <YAxis />
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
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold">Recent Activity</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-400 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-gray-400 uppercase">User</th>
              <th className="px-6 py-3 text-left text-gray-400 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-gray-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-gray-400">Loading...</td>
              </tr>
            ) : data.recentActivity.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-gray-400">No activity yet</td>
              </tr>
            ) : (
              data.recentActivity.map((row) => (
                <tr key={row.id}>
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
          <button className="flex items-center gap-2 bg-[#f59e0b] text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
            <Plus size={18} /> Add User
          </button>
          <button className="flex items-center gap-2 border border-[#14b8a6] text-[#14b8a6] px-5 py-2.5 rounded-xl font-semibold text-sm">
            <Percent size={18} /> Create Coupon
          </button>
          <button className="flex items-center gap-2 border border-[#14b8a6] text-[#14b8a6] px-5 py-2.5 rounded-xl font-semibold text-sm">
            <Download size={18} /> Export Reports
          </button>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
