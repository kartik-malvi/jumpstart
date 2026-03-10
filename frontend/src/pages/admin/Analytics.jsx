import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar, CheckCircle, CreditCard, Download, FileText, Play, TrendingDown, TrendingUp, Users } from "lucide-react";
import useAdminLiveData from "../../hooks/useAdminLiveData";
import { downloadCsv, openPrintPdf } from "../../utils/adminExport";

const MetricCard = ({ title, value, detail, icon, trend = "up" }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex flex-col gap-2">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
      </div>
      <div className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center">{icon}</div>
    </div>
    <div className={`text-xs font-semibold flex items-center gap-1 ${trend === "up" ? "text-emerald-500" : "text-amber-500"}`}>
      {trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {detail}
    </div>
  </div>
);

const Panel = ({ title, subtitle, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    <p className="text-sm text-slate-400 mt-1 mb-6">{subtitle}</p>
    <div className="h-72">{children}</div>
  </div>
);

const Analytics = () => {
  const { data, loading, error } = useAdminLiveData(5000);
  const [selectedRange, setSelectedRange] = useState("Last 30 Days");

  const completionData = data.analytics?.completionByPackage || [];
  const revenueDistribution = data.analytics?.revenueDistribution || [];
  const registrationTrend = data.analytics?.registrationTrend || [];
  const topCareers = data.analytics?.topCareers || [];

  const metrics = useMemo(
    () => [
      {
        title: "Users",
        value: data.kpis.totalUsers || 0,
        detail: `${selectedRange} registrations overview`,
        icon: <Users size={20} />,
      },
      {
        title: "Tests Purchased",
        value: data.kpis.testsPurchased || 0,
        detail: "Completed orders",
        icon: <CreditCard size={20} />,
      },
      {
        title: "Completed Tests",
        value: data.kpis.completedTests || 0,
        detail: "Finished assessments",
        icon: <CheckCircle size={20} />,
      },
      {
        title: "Revenue",
        value: data.kpis.revenueLabel || "₹0",
        detail: "Successful payments",
        icon: <Play size={20} />,
      },
    ],
    [data.kpis, selectedRange]
  );

  const exportCsv = () => {
    const rows = [
      ["Section", "Label", "Value 1", "Value 2"],
      ...completionData.map((item) => ["Completion", item.name, item.started, item.completed]),
      ...revenueDistribution.map((item) => ["Revenue Distribution", item.name, item.value, ""]),
      ...registrationTrend.map((item) => ["Registrations", item.date, item.value, ""]),
      ...topCareers.map((item) => ["Top Careers", item.name, item.value, ""]),
    ];
    downloadCsv("service-analytics.csv", rows);
  };

  const exportPdf = () =>
    openPrintPdf("Jumpstart Analytics Report", [
      {
        title: "Package Completion",
        headers: ["Package", "Started", "Completed"],
        rows: completionData.map((item) => [item.name, item.started, item.completed]),
      },
      {
        title: "Registration Trend",
        headers: ["Date", "Registrations"],
        rows: registrationTrend.map((item) => [item.date, item.value]),
      },
      {
        title: "Revenue Distribution",
        headers: ["Package", "Revenue Count"],
        rows: revenueDistribution.map((item) => [item.name, item.value]),
      },
      {
        title: "Top Careers",
        headers: ["Career", "Matches"],
        rows: topCareers.map((item) => [item.name, item.value]),
      },
    ]);

  return (
    <div className="max-w-[1440px] mx-auto p-6 md:p-8 w-full flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Live overview of registrations, completion and revenue</p>
          {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm text-sm text-gray-500">
            <Calendar size={16} />
            <select value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)} className="bg-transparent outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-2xl border border-[#14b8a6] text-[#14b8a6] px-4 py-3 font-semibold text-sm">
            <Download size={16} />
            Export CSV
          </button>
          <button onClick={exportPdf} className="flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 font-semibold text-sm">
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel title="Test Completion by Package" subtitle="Started vs completed by subscription">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="started" fill="#b2e9e1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="completed" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Revenue by Package" subtitle="Distribution of completed-payment package revenue">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={revenueDistribution} dataKey="value" nameKey="name" innerRadius={72} outerRadius={104}>
                {revenueDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel title="User Registration Trend" subtitle="Daily registrations">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={registrationTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Top Career Recommendations" subtitle="Most frequent recommended career paths">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={topCareers} margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={120} />
              <Tooltip />
              <Bar dataKey="value" fill="#14b8a6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {loading && <div className="text-sm text-gray-400">Loading analytics...</div>}
    </div>
  );
};

export default Analytics;
