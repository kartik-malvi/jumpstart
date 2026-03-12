import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  CreditCard,
  BarChart3,
  Settings,
  CircleDot,
  X,
} from "lucide-react";

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/service/dashboard" },
    { icon: <FileText size={20} />, label: "Records", path: "/service/testsubmissions" },
    { icon: <CheckSquare size={20} />, label: "Tests", path: "/service/publishedresults" },
    { icon: <CircleDot size={20} />, label: "Status", path: "/service/publishedresults" },
    { icon: <Users size={20} />, label: "Users", path: "/service/usermanagement" },
    { icon: <CreditCard size={20} />, label: "Payments", path: "/service/payments" },
    { icon: <BarChart3 size={20} />, label: "Analytics", path: "/service/analytics" },
    { icon: <Settings size={20} />, label: "Settings", path: "/service/settings" },
  ];

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-20 bg-slate-950/30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-30 transition-all duration-300
        ${isOpen ? "translate-x-0 w-64 md:w-20" : "-translate-x-full md:translate-x-0 md:w-0 overflow-hidden"}`}
      >
      <div className="flex h-full flex-col py-6">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-between px-4 md:justify-center md:px-0">
          <div className="w-10 h-10 bg-[#14b8a6] rounded-lg flex items-center justify-center text-white font-bold text-xl">
            J
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 px-3 md:px-0 md:items-center md:gap-6">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `rounded-lg transition-colors flex items-center gap-3 px-3 py-2.5 md:justify-center md:px-2
                ${
                  isActive
                    ? "bg-[#14b8a61a] text-[#14b8a6]"
                    : "text-gray-400 hover:text-gray-600"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span className="text-sm font-semibold md:hidden">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
    </>
  );
};

export default AdminSidebar;
