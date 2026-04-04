import React from "react";
import { NavLink } from "react-router-dom";
import { footerItems, navItems } from "../configs/navigationConfig";
import { useAppContext } from "../context/AppContext";
import { LayoutDashboard, Receipt, BarChart2, Settings, LifeBuoy, LogOut, Zap, Plus, X } from "lucide-react";

const SideNav = () => {
  const { activeRole, setIsModalOpen, setEditingTransaction, isMobileMenuOpen, setIsMobileMenuOpen } = useAppContext();
  
  const iconMap = {
    dashboard: LayoutDashboard,
    transactions: Receipt,
    insights: BarChart2,
    settings: Settings,
    support: LifeBuoy,
    logout: LogOut,
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col space-y-8 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 uppercase tracking-widest text-[10px] transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container">
              <Zap size={18} className="text-[#131313]" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-gray-800 dark:text-gray-100 normal-case">Zorvyn</h1>
              <p className="text-[8px] text-gray-500 dark:text-gray-400">Finance Dashboard</p>
            </div>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(({ id, path, label }) => {
            const Icon = iconMap[id] || LayoutDashboard;
            return (
              <NavLink
                key={id}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-md px-4 py-3 transition-all duration-150 ${isActive
                    ? "translate-x-1 bg-gradient-to-br from-primary to-primary-container text-white shadow-lg"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-gray-200"
                  }`
                }
                to={path}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="space-y-4">
          {activeRole === "Admin" && (
            <button
              onClick={() => { setEditingTransaction(null); setIsModalOpen(true); setIsMobileMenuOpen(false); }}
              className="mt-auto flex w-full items-center justify-center space-x-2 rounded-md bg-primary-container px-4 py-3 text-[11px] font-bold text-white transition-all hover:brightness-110"
              type="button"
            >
              <Plus size={16} />
              <span>Add Transaction</span>
            </button>
          )}

          <div className="space-y-1">
            {footerItems.map(({ id, path, label }) => {
              const Icon = iconMap[id] || LifeBuoy;
              return (
                <a
                  key={id}
                  className="flex items-center space-x-3 rounded-md px-4 py-2 text-gray-500 dark:text-gray-400 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-gray-200"
                  href={path}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideNav;
