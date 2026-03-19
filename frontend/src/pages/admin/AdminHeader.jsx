import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, Settings } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import useAdminLiveData from "../../hooks/useAdminLiveData";
import { timeAgo } from "../../utils/adminFormat";

const ADMIN_NOTIFICATION_SEEN_KEY = "admin_notification_seen_at";
const ADMIN_NOTIFICATION_CLEARED_AT_KEY = "admin_notification_cleared_at";

const initialsFromName = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const playNotificationBell = () => {
  if (typeof window === "undefined") return;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return;

  const ctx = new AudioContextCtor();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.18);

  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.52);
  oscillator.onended = () => {
    ctx.close().catch(() => {});
  };
};

const AdminHeader = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { data } = useAdminLiveData(5000);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const latestNotificationRef = useRef(null);
  const hasHydratedNotificationsRef = useRef(false);

  useEffect(() => {
    const onMouseDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
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

  const clearedAt = Number(localStorage.getItem(ADMIN_NOTIFICATION_CLEARED_AT_KEY) || 0);
  const notifications = (data.recentActivity || [])
    .filter((item) => {
      const createdAt = new Date(item.date).getTime();
      return Number.isFinite(createdAt) && createdAt > clearedAt;
    })
    .slice(0, 8);
  const lastSeenAt = Number(localStorage.getItem(ADMIN_NOTIFICATION_SEEN_KEY) || 0);
  const unreadCount = notifications.filter((item) => {
    const createdAt = new Date(item.date).getTime();
    return Number.isFinite(createdAt) && createdAt > lastSeenAt;
  }).length;

  useEffect(() => {
    const latestNotificationTime = notifications[0]?.date ? new Date(notifications[0].date).getTime() : 0;
    if (!Number.isFinite(latestNotificationTime) || latestNotificationTime <= 0) return;

    if (!hasHydratedNotificationsRef.current) {
      hasHydratedNotificationsRef.current = true;
      latestNotificationRef.current = latestNotificationTime;
      return;
    }

    if (latestNotificationRef.current && latestNotificationTime > latestNotificationRef.current) {
      playNotificationBell();
    }

    latestNotificationRef.current = latestNotificationTime;
  }, [notifications]);

  const markNotificationsRead = () => {
    const newest = notifications[0]?.date ? new Date(notifications[0].date).getTime() : Date.now();
    localStorage.setItem(ADMIN_NOTIFICATION_SEEN_KEY, String(newest));
  };

  const toggleNotifications = () => {
    setShowProfileDropdown(false);
    setShowNotifications((open) => {
      const nextOpen = !open;
      if (nextOpen) markNotificationsRead();
      return nextOpen;
    });
  };

  const handleClearNotifications = () => {
    const newest = notifications[0]?.date ? new Date(notifications[0].date).getTime() : Date.now();
    localStorage.setItem(ADMIN_NOTIFICATION_CLEARED_AT_KEY, String(newest));
    localStorage.setItem(ADMIN_NOTIFICATION_SEEN_KEY, String(newest));
    setShowNotifications(false);
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

      <div className="ml-auto flex items-center gap-3">
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={toggleNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-[#14b8a6]/30 hover:text-[#14b8a6]"
            aria-label="Open notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-[min(90vw,24rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
              <div className="border-b border-gray-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                    <p className="mt-1 text-xs text-gray-400">Live updates from user and admin activity</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearNotifications}
                    disabled={notifications.length === 0}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="max-h-[26rem] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet</div>
                ) : (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/service/dashboard");
                      }}
                      className="flex w-full flex-col gap-1 border-b border-gray-50 px-4 py-3 text-left transition hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">{item.action}</p>
                        <span className="text-[11px] font-medium text-gray-400">{timeAgo(item.date)}</span>
                      </div>
                      <p className="text-xs text-gray-500">{item.user}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
        <button
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => {
            setShowNotifications(false);
            setShowProfileDropdown((open) => !open);
          }}
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
