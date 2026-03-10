import React, { useState, useMemo } from "react";
import { Search, ChevronDown, MoreVertical } from "lucide-react";
import useAdminLiveData from "../../hooks/useAdminLiveData";
import { formatDateTime } from "../../utils/adminFormat";

const StatusBadge = ({ status }) => {
  const styles = {
    Submitted: "bg-emerald-50 text-emerald-600 border-emerald-100",
    "In Review": "bg-orange-50 text-orange-600 border-orange-100",
    Scored: "bg-slate-50 text-slate-500 border-slate-100",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles[status] || styles.Submitted}`}>
      {status}
    </span>
  );
};

const TestTypeBadge = ({ type }) => (
  <span className="px-3 py-1 rounded-full text-[11px] font-bold border border-gray-100 bg-white text-gray-700">
    {type}
  </span>
);

const TestSubmissions = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const { data, loading } = useAdminLiveData(5000);

  const filteredData = useMemo(() => {
    return (data.submissions || []).filter((row) => {
      const matchesSearch =
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        row.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter ? row.status === statusFilter : true;
      const matchesType = typeFilter ? row.type === typeFilter : true;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [data.submissions, search, statusFilter, typeFilter]);

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900">Test Submissions</h1>
        <p className="text-gray-400 text-sm">Review and manage student test submissions</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="">All Status</option>
              <option>Submitted</option>
              <option>In Review</option>
              <option>Scored</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:w-40">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="">All Types</option>
              <option>Basic</option>
              <option>Standard</option>
              <option>Premium</option>
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
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Test Type</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Submitted</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Duration</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">Loading...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">No results found</td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 text-[#14b8a6] flex items-center justify-center font-bold text-xs border border-teal-100">
                          {row.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{row.name}</span>
                          <span className="text-xs text-gray-400">{row.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <TestTypeBadge type={row.type} />
                    </td>

                    <td className="px-6 py-5 text-center text-sm text-gray-500 font-medium">{formatDateTime(row.date)}</td>

                    <td className="px-6 py-5 text-center text-sm text-gray-700 font-semibold">{row.duration || "--"}</td>

                    <td className="px-6 py-5 text-center">
                      <StatusBadge status={row.status} />
                    </td>

                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestSubmissions;
