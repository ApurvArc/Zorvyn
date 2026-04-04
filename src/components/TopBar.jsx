import React, { useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useLocation } from "react-router-dom";
import { Menu, Search, Plus, Moon, Sun, Bell } from "lucide-react";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/transactions": "Financial Ledger",
  "/insights": "Financial Intelligence",
  "/settings": "Account Settings",
};

const TopBar = () => {
  const {
    activeRole, setActiveRole, searchTerm, setSearchTerm, setIsModalOpen,
    setEditingTransaction, theme, toggleTheme, notifications, setNotifications, userProfile,
    isMobileMenuOpen, setIsMobileMenuOpen
  } = useAppContext();
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

  const markAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const title = pageTitles[location.pathname] || "Zorvyn";

  return (
    <header className="fixed top-0 left-64 right-0 z-50 max-lg:left-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center px-8 py-3 antialiased tracking-tight transition-colors duration-300">
      {/* Left: Title + Search */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden text-gray-800 dark:text-gray-100 p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-100">{title}</h1>
        </div>
        <div className="hidden md:flex items-center bg-gray-50 dark:bg-slate-800 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700 w-56">
          <Search size={14} className="text-gray-500 dark:text-gray-400 mr-2" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm text-gray-800 dark:text-gray-100 w-full placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
            placeholder="Search Zorvyn..."
            type="text"
          />
        </div>
      </div>

      {/* Right: Actions + User */}
      <div className="flex items-center space-x-4">
        {/* Role Switcher — click to toggle Admin / Viewer */}
        <button
          onClick={() => setActiveRole(prev => prev === "Admin" ? "Viewer" : "Admin")}
          title="Click to switch role"
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
            activeRole === "Admin"
              ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              : "bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${ activeRole === "Admin" ? "bg-primary" : "bg-gray-400" }`} />
          {activeRole}
        </button>
        <span className="hidden sm:inline select-none text-gray-300 dark:text-gray-600">|</span>

        {activeRole === "Admin" && (
          <>
            <button
              onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
              className="hidden sm:flex items-center space-x-1.5 bg-primary-container px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:brightness-110"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
            <span className="hidden sm:inline select-none text-gray-300 dark:text-gray-600">|</span>
          </>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
          >
            <Bell size={18} />
          </button>
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
          )}

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-xl overflow-hidden z-[100] animate-fade-in text-gray-800 dark:text-gray-100">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                <h3 className="font-bold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAsRead}
                    className="text-primary text-[10px] uppercase font-bold tracking-widest hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 border-b border-gray-100 dark:border-gray-700 transition-colors cursor-pointer relative ${n.isRead ? 'opacity-50' : ''}`}
                    >
                      {!n.isRead && <div className="absolute left-0 top-0 w-1 h-full bg-primary shadow-sm"></div>}
                      <p className={`${n.color} text-[10px] uppercase font-bold tracking-widest mb-1`}>{n.type}</p>
                      <p className="text-sm font-bold mb-1">{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{n.desc}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">{n.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-xs italic">
                    No active notifications
                  </div>
                )}
              </div>
              <div className="p-3 text-center bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-t border-gray-200 dark:border-gray-700 group">
                <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-widest group-hover:text-primary transition-colors">View Archives</span>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{userProfile.fullName}</p>
            <p className="text-[10px] text-primary uppercase tracking-tighter">{activeRole}</p>
          </div>
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full border border-primary/20"
            src={userProfile.avatar}
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
