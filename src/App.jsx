import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import SideNav from "./components/SideNav";
import TopBar from "./components/TopBar";
import Dashboard from "./pages/dashboard/Dashboard";
import Insights from "./pages/insights/Insights";
import Settings from "./pages/settings/Settings";
import Transactions from "./pages/transactions/Transactions";
import TransactionModal from "./components/TransactionModal";

const AppShell = () => {
  return (
    <div className="min-h-screen bg-background text-on-background transition-colors duration-300">
      <SideNav />
      <div className="ml-64 max-lg:ml-0">
        <TopBar />
        <Outlet />
      </div>
      <TransactionModal />
      <Toaster position="bottom-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white border dark:border-gray-700' }} />
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default App;
