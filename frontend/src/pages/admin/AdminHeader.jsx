import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, Settings } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import ConfirmDialog from "../../components/ConfirmDialog";

const initialsFromName = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const AdminHeader = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onMouseDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/service/login");
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-3 bg-white border-b border-gray-100 px-4 py-3 md:px-6 shadow-sm">
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">Service</p>
          <h1 className="truncate text-sm font-bold text-gray-900">Jumpstart Admin</h1>
        </div>
      </div>

      <div className="relative ml-auto" ref={profileRef}>
        <button
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setShowProfileDropdown((open) => !open)}
        >
          <div className="w-9 h-9 bg-[#14b8a6] text-white rounded-full flex items-center justify-center font-medium text-sm border-2 border-[#14b8a61a] group-hover:border-[#14b8a644] transition-all">
            {initialsFromName(user?.name || "Admin")}
          </div>
          <div className="hidden md:flex flex-col items-start leading-none gap-1">
            <span className="text-xs font-bold text-gray-900">{user?.name || "Admin"}</span>
            <span className="text-[10px] text-gray-400 font-medium">{user?.email || "admin"}</span>
          </div>
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform duration-200 ${showProfileDropdown ? "rotate-180" : ""}`}
          />
        </button>

        {showProfileDropdown && (
          <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
            <div className="p-4 border-b border-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
              <p className="text-sm font-bold text-gray-900 truncate mt-1">{user?.email}</p>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  navigate("/service/settings");
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Settings size={18} className="text-gray-400" />
                Account Settings
              </button>
            </div>

            <div className="p-2 border-t border-gray-50">
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Logout from admin?"
        message="You will be signed out of the admin panel on this device."
        confirmLabel="Logout"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </header>
  );
};

export default AdminHeader;
