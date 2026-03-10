import React, { useState, useMemo } from "react";
import { Search, ChevronDown, MoreVertical } from "lucide-react";
import useAdminLiveData from "../../hooks/useAdminLiveData";
import { timeAgo } from "../../utils/adminFormat";

const SubscriptionBadge = ({ type }) => {
  const styles = {
    Standard: "bg-[#14b8a61a] text-[#14b8a6] border-[#14b8a62a]",
    Premium: "bg-[#0f766e] text-white border-transparent",
    Basic: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles[type] || styles.Basic}`}>
      {type}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Active: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Suspended: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles[status] || styles.Active}`}>
      {status}
    </span>
  );
};

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [subscriptionFilter, setSubscriptionFilter] = useState("All");
  const { data, loading } = useAdminLiveData(5000);

  const filteredUsers = useMemo(() => {
    return (data.users || []).filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || user.status === statusFilter;
      const matchesSubscription = subscriptionFilter === "All" || user.subscription === subscriptionFilter;

      return matchesSearch && matchesStatus && matchesSubscription;
    });
  }, [data.users, searchQuery, statusFilter, subscriptionFilter]);

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto font-['Inter'] p-6 md:p-8 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
        <p className="text-gray-400 text-sm font-medium">Manage user accounts and permissions</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
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
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative w-full md:w-40">
            <select
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="All">Subscription</option>
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
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
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Tests</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Subscription</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Last Login</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-50 text-[#14b8a6] flex items-center justify-center font-bold text-[11px] border border-teal-100">
                          {user.initials}
                        </div>
                        <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500 font-medium whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-5 text-sm text-gray-500 font-medium whitespace-nowrap">{user.phone}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-600 text-xs font-bold border border-gray-100">
                        {user.tests}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <SubscriptionBadge type={user.subscription} />
                    </td>
                    <td className="px-6 py-5 text-center text-sm text-gray-500 font-medium whitespace-nowrap">
                      {timeAgo(user.lastLoginAt)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <StatusBadge status={user.status} />
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
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">No users found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
