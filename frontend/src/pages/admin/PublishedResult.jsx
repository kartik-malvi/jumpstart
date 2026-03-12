import React, { useMemo, useState } from "react";
import { Search, ChevronDown, Download, MoreVertical, ExternalLink } from "lucide-react";
import api from "../../api/api";
import useAdminLiveData from "../../hooks/useAdminLiveData";
import { formatDateTime } from "../../utils/adminFormat";
import { openResultReportPdf, openResultReportPreview } from "../../utils/resultReport";

const PercentileBadge = ({ value }) => (
  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#14b8a6] text-white">{value}</span>
);

const TestTypeBadge = ({ type }) => (
  <span className="px-3 py-1 rounded-full text-[11px] font-bold border border-gray-100 bg-white text-gray-700">{type}</span>
);

const PublishedResults = () => {
  const [search, setSearch] = useState("");
  const [testType, setTestType] = useState("");
  const [activeMenu, setActiveMenu] = useState("");
  const [loadingReportId, setLoadingReportId] = useState("");
  const [actionError, setActionError] = useState("");
  const { data, loading } = useAdminLiveData(5000);

  const filteredResults = useMemo(() => {
    return (data.publishedResults || []).filter((row) => {
      const matchSearch =
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        row.email.toLowerCase().includes(search.toLowerCase());
      const matchType = testType ? row.type === testType : true;
      return matchSearch && matchType;
    });
  }, [data.publishedResults, search, testType]);

  const fetchReport = async (userId) => {
    const res = await api.get(`/v1/admin/results/${userId}`);
    return res?.data?.data;
  };

  const handleDownload = async (row) => {
    setActionError("");
    setLoadingReportId(row.id);
    try {
      const report = await fetchReport(row.id);
      openResultReportPdf(report);
      setActiveMenu("");
    } catch (err) {
      setActionError(err?.response?.data?.msg || "Failed to download report");
    } finally {
      setLoadingReportId("");
    }
  };

  const handlePreview = async (row) => {
    setActionError("");
    setLoadingReportId(row.id);
    try {
      const report = await fetchReport(row.id);
      openResultReportPreview(report);
      setActiveMenu("");
    } catch (err) {
      setActionError(err?.response?.data?.msg || "Failed to open report");
    } finally {
      setLoadingReportId("");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto font-['Inter'] p-6 md:p-8 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Published Results</h1>
        <p className="text-gray-400 text-sm">Manage published test results and student queries</p>
        {actionError && <p className="text-xs text-rose-500 mt-2">{actionError}</p>}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/10 transition-all shadow-sm"
          />
        </div>

        <div className="relative w-full md:w-48">
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="">Test Type</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/20">
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Test Type</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Published Date</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Score</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Percentile</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Download</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">Loading...</td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">No results found</td>
                </tr>
              ) : (
                filteredResults.map((row) => (
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

                    <td className="px-6 py-5 text-center text-base text-gray-900 font-bold">{row.score}</td>

                    <td className="px-6 py-5 text-center">
                      <PercentileBadge value={row.percentile} />
                    </td>

                    <td className="px-6 py-5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDownload(row)}
                        disabled={loadingReportId === row.id}
                        className="p-2 text-gray-400 hover:text-[#14b8a6] hover:bg-teal-50 rounded-lg transition-all disabled:cursor-not-allowed disabled:text-gray-300"
                      >
                        <Download size={18} />
                      </button>
                    </td>

                    <td className="px-6 py-5 text-right relative overflow-visible">
                      <button
                        type="button"
                        onClick={() => setActiveMenu((current) => (current === row.id ? "" : row.id))}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {activeMenu === row.id && (
                        <div className="absolute right-6 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handlePreview(row)}
                            disabled={loadingReportId === row.id}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 disabled:text-slate-400 disabled:hover:bg-white"
                          >
                            <span className="inline-flex items-center gap-2">
                              <ExternalLink size={14} />
                              {loadingReportId === row.id ? "Loading..." : "Open report"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(row)}
                            disabled={loadingReportId === row.id}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 disabled:text-slate-400 disabled:hover:bg-white"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Download size={14} />
                              {loadingReportId === row.id ? "Loading..." : "Download PDF"}
                            </span>
                          </button>
                        </div>
                      )}
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

export default PublishedResults;
