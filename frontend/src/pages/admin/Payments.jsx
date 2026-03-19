import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Download,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Smartphone,
  Calendar,
  Clock,
  RefreshCcw,
  Zap,
} from "lucide-react";
import useAdminLiveData from "../../hooks/useAdminLiveData";
import { formatDateTime } from "../../utils/adminFormat";
import { downloadCsv, openPrintPdf } from "../../utils/adminExport";

const formatRupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const MiniKPI = ({ title, value, change, trend, icon, iconColor, iconBg }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex flex-col gap-2 flex-1 min-w-[200px]">
    <div className="flex justify-between items-start">
      <div className="flex flex-col">
        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</span>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor}`}>{icon}</div>
    </div>
    <div className="flex items-center gap-1.5 mt-1">
      <div className={`flex items-center ${trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
        {trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span className="text-[13px] font-bold ml-1">{change}</span>
      </div>
    </div>
  </div>
);

const PackageBadge = ({ type }) => (
  <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-gray-100 bg-white text-gray-700">{type}</span>
);

const PaymentStatusBadge = ({ status }) => {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Pending: "bg-slate-50 text-slate-400 border-slate-100",
    Failed: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles[status] || styles.Completed}`}>
      {status}
    </span>
  );
};

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const { data, loading } = useAdminLiveData(5000);

  const paymentsData = data.payments || [];

  const filteredPayments = useMemo(() => {
    return paymentsData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesMethod = methodFilter === "All" || item.method === methodFilter;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [paymentsData, searchQuery, statusFilter, methodFilter]);

  const totalRevenue = paymentsData.filter((p) => p.status === "Completed").reduce((sum, p) => sum + (p.amount || 0), 0);
  const thisMonthRevenue = paymentsData
    .filter((p) => {
      const d = new Date(p.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && p.status === "Completed";
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingRevenue = paymentsData.filter((p) => p.status === "Pending").reduce((sum, p) => sum + (p.amount || 0), 0);
  const refundedRevenue = 0;

  const handleExportAll = () => {
    const rows = [
      ["Order ID", "Student", "Email", "Package", "Amount", "Method", "Date", "Status"],
      ...filteredPayments.map((item) => [
        item.id,
        item.name,
        item.email,
        item.package,
        item.amountLabel,
        item.method,
        formatDateTime(item.date),
        item.status,
      ]),
    ];

    downloadCsv("payments-export.csv", rows);
    openPrintPdf("Jumpstart Payments Report", [
      {
        title: "Payments",
        headers: ["Order ID", "Student", "Package", "Amount", "Method", "Date", "Status"],
        rows: filteredPayments.map((item) => [
          item.id,
          item.name,
          item.package,
          item.amountLabel,
          item.method,
          formatDateTime(item.date),
          item.status,
        ]),
      },
    ]);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto font-['Inter'] p-6 md:p-8 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payments & Orders</h1>
          <p className="text-gray-400 text-sm font-medium">Manage transactions and refunds</p>
        </div>
        <button
          type="button"
          onClick={handleExportAll}
          className="flex items-center gap-2 border border-[#14b8a6] text-[#14b8a6] hover:bg-teal-50 px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm self-start md:self-center"
        >
          <Download size={18} />
          Export All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MiniKPI title="Total Revenue" value={formatRupees(totalRevenue)} change="Live" trend="up" icon={<Zap size={20} />} iconBg="bg-teal-50" iconColor="text-teal-500" />
        <MiniKPI title="This Month" value={formatRupees(thisMonthRevenue)} change="Live" trend="up" icon={<Calendar size={20} />} iconBg="bg-orange-50" iconColor="text-orange-500" />
        <MiniKPI title="Pending" value={formatRupees(pendingRevenue)} change="Live" trend="down" icon={<Clock size={20} />} iconBg="bg-rose-50" iconColor="text-rose-500" />
        <MiniKPI title="Refunded" value={formatRupees(refundedRevenue)} change="Live" trend="up" icon={<RefreshCcw size={20} />} iconBg="bg-teal-50" iconColor="text-teal-500" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID or student name..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/10 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="All">Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative w-full md:w-48">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="All">Payment Method</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Wallet">Wallet</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/20">
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Package</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Amount</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Method</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Date</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">Loading...</td>
                </tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 text-xs font-bold text-gray-500 whitespace-nowrap">{item.id}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-50 text-[#14b8a6] flex items-center justify-center font-bold text-[11px] border border-teal-100">
                          {item.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{item.name}</span>
                          <span className="text-[11px] text-gray-400 font-medium">{item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <PackageBadge type={item.package} />
                    </td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-gray-900">{item.amountLabel}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        {item.method === "Card" ? <CreditCard size={14} /> : <Smartphone size={14} />}
                        <span className="text-xs font-medium">{item.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-[13px] text-gray-400 font-medium whitespace-nowrap">{formatDateTime(item.date)}</td>
                    <td className="px-6 py-5 text-center">
                      <PaymentStatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
