import React, { useMemo, useState } from "react";
import { ChevronDown, MoreVertical, Search, Trash2, X } from "lucide-react";
import api from "../../api/api";
import useAdminLiveData from "../../hooks/useAdminLiveData";
import { timeAgo } from "../../utils/adminFormat";
import PasswordField from "../../components/PasswordField";

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

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [subscriptionFilter, setSubscriptionFilter] = useState("All");
  const [activeMenu, setActiveMenu] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", subscription: "Basic", status: "Active", role: "user" });
  const [password, setPassword] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState("");
  const { data, loading, refetch } = useAdminLiveData(5000);

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

  const openEdit = (user) => {
    setActiveMenu("");
    setActionError("");
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone === "-" ? "" : user.phone,
      subscription: user.subscription,
      status: user.status,
      role: user.role || "user",
    });
  };

  const openPassword = (user) => {
    setActiveMenu("");
    setActionError("");
    setPassword("");
    setPasswordUser(user);
  };

  const updateUser = async (payload) => {
    if (!editingUser) return;
    setSaving(true);
    setActionError("");
    try {
      await api.patch(`/v1/admin/users/${editingUser.id}`, payload);
      setSaving(false);
      setEditingUser(null);
      refetch();
    } catch (err) {
      setActionError(err?.response?.data?.msg || "Failed to update user");
      setSaving(false);
    }
  };

  const handleQuickStatusToggle = async (user) => {
    setActiveMenu("");
    try {
      await api.patch(`/v1/admin/users/${user.id}`, {
        status: user.status === "Active" ? "Suspended" : "Active",
      });
      refetch();
    } catch (err) {
      setActionError(err?.response?.data?.msg || "Failed to update status");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!passwordUser) return;
    setSaving(true);
    setActionError("");
    try {
      await api.post(`/v1/admin/users/${passwordUser.id}/reset-password`, { password });
      setSaving(false);
      setPasswordUser(null);
      setPassword("");
      refetch();
    } catch (err) {
      setActionError(err?.response?.data?.msg || "Failed to reset password");
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(`Delete user ${user.name}? This cannot be undone.`);
    if (!confirmed) return;

    setActiveMenu("");
    setDeletingUserId(user.id);
    setActionError("");
    try {
      await api.delete(`/v1/admin/users/${user.id}`);
      await refetch();
    } catch (err) {
      setActionError(err?.response?.data?.msg || "Failed to delete user");
    } finally {
      setDeletingUserId("");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto font-['Inter'] p-6 md:p-8 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
        <p className="text-gray-400 text-sm font-medium">Manage user accounts, status and passwords</p>
        {actionError && !editingUser && !passwordUser && <p className="text-sm text-rose-500 mt-2">{actionError}</p>}
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
                    <td className="px-6 py-5 text-right relative">
                      <button
                        onClick={() => setActiveMenu((current) => (current === user.id ? "" : user.id))}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {activeMenu === user.id && (
                        <div className="absolute right-6 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 overflow-hidden">
                          <button onClick={() => openEdit(user)} className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50">
                            Edit user
                          </button>
                          <button onClick={() => openPassword(user)} className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50">
                            Change password
                          </button>
                          <button onClick={() => handleQuickStatusToggle(user)} className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50">
                            {user.status === "Active" ? "Suspend user" : "Activate user"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={deletingUserId === user.id}
                            className="w-full px-4 py-3 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:text-slate-400 disabled:hover:bg-white"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Trash2 size={14} />
                              {deletingUserId === user.id ? "Deleting..." : "Delete user"}
                            </span>
                          </button>
                        </div>
                      )}
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

      {editingUser && (
        <Modal title={`Edit ${editingUser.name}`} onClose={() => { setEditingUser(null); setSaving(false); setActionError(""); }}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              updateUser({
                name: editForm.name,
                email: editForm.email,
                mobile: editForm.phone,
                subscription: editForm.subscription,
                status: editForm.status,
                role: editForm.role,
              });
            }}
          >
            <input className="w-full border border-slate-200 rounded-2xl px-4 py-3" value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} required />
            <input className="w-full border border-slate-200 rounded-2xl px-4 py-3" type="email" value={editForm.email} onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))} required />
            <input className="w-full border border-slate-200 rounded-2xl px-4 py-3" value={editForm.phone} onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" />
            <div className="grid grid-cols-3 gap-4">
              <select className="border border-slate-200 rounded-2xl px-4 py-3" value={editForm.subscription} onChange={(e) => setEditForm((prev) => ({ ...prev, subscription: e.target.value }))}>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
              <select className="border border-slate-200 rounded-2xl px-4 py-3" value={editForm.status} onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
              <select className="border border-slate-200 rounded-2xl px-4 py-3" value={editForm.role} onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {actionError && <p className="text-sm text-rose-500">{actionError}</p>}
            <button type="submit" disabled={saving} className="w-full rounded-2xl bg-slate-900 text-white py-3 font-semibold disabled:opacity-60">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </Modal>
      )}

      {passwordUser && (
        <Modal title={`Change Password: ${passwordUser.name}`} onClose={() => { setPasswordUser(null); setSaving(false); setActionError(""); }}>
          <form className="space-y-4" onSubmit={handlePasswordReset}>
            <PasswordField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputClassName="w-full border border-slate-200 rounded-2xl px-4 py-3 pr-12"
              placeholder="New password"
              minLength={6}
              required
              autoComplete="new-password"
            />
            {actionError && <p className="text-sm text-rose-500">{actionError}</p>}
            <button type="submit" disabled={saving} className="w-full rounded-2xl bg-slate-900 text-white py-3 font-semibold disabled:opacity-60">
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
