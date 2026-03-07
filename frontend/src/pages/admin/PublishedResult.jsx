import React, { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, Download } from "lucide-react";
import api from "../../api/api";

const PercentileBadge = ({ value }) => <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#14b8a6] text-white">{value || "-"}</span>;

const PublishedResults = () => {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [testType, setTestType] = useState("");

  useEffect(() => {
    api
      .get("/v1/admin/results")
      .then((res) => setRows(res?.data?.data || []))
      .catch((err) => console.error("Results load failed:", err));
  }, []);

  const filteredResults = useMemo(
    () =>
      rows.filter((row) => {
        const matchSearch = row.name.toLowerCase().includes(search.toLowerCase()) || row.email.toLowerCase().includes(search.toLowerCase());
        const matchType = testType ? row.type === testType : true;
        return matchSearch && matchType;
      }),
    [rows, search, testType]
  );

  const downloadRow = (row) => {
    const blob = new Blob([JSON.stringify(row.rawResult || {}, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${row.name.replace(/\s+/g, "_").toLowerCase()}-result.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-[1440px] mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Published Results</h1>
        <p className="text-gray-400 text-sm">Dynamic results list</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search by student name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm" />
        </div>
        <div className="relative w-full md:w-48">
          <select value={testType} onChange={(e) => setTestType(e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600">
            <option value="">Test Type</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/20">
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Test Type</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Published Date</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Score</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Percentile</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredResults.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">No results found</td></tr>
              ) : (
                filteredResults.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 text-[#14b8a6] flex items-center justify-center font-bold text-xs border border-teal-100">{row.initials}</div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{row.name}</span>
                          <span className="text-xs text-gray-400">{row.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-sm">{row.type}</td>
                    <td className="px-6 py-5 text-center text-sm text-gray-500 font-medium">{row.date}</td>
                    <td className="px-6 py-5 text-center text-base text-gray-900 font-bold">{row.score}</td>
                    <td className="px-6 py-5 text-center"><PercentileBadge value={row.percentile} /></td>
                    <td className="px-6 py-5 text-right">
                      <button onClick={() => downloadRow(row)} className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-lg hover:bg-gray-50">
                        <Download size={14} /> Download
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

export default PublishedResults;
