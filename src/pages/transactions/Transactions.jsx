import React from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const Transactions = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const filterRef = React.useRef(null);

  // Close filter dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const {
    activeRole,
    filteredTransactions,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortOrder,
    setSortOrder,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    parsedAmount,
    deleteTransaction,
    setIsModalOpen,
    setEditingTransaction,
    totals,
    categories,
    auditCompliance,
  } = useAppContext();

  // Local state for staging filters before applying
  const [localCategory, setLocalCategory] = React.useState(selectedCategory);
  const [localSort, setLocalSort] = React.useState(sortOrder);
  const [localMin, setLocalMin] = React.useState(minAmount);
  const [localMax, setLocalMax] = React.useState(maxAmount);
  const [localStart, setLocalStart] = React.useState(startDate);
  const [localEnd, setLocalEnd] = React.useState(endDate);

  // Real-time validation
  const filterValidationError = React.useMemo(() => {
    if (localMin && localMax && parseFloat(localMin) > parseFloat(localMax)) {
      return "Min amount cannot be greater than max amount";
    }
    if (localStart && localEnd && new Date(localStart) > new Date(localEnd)) {
      return "Start date cannot be after end date";
    }
    return "";
  }, [localMin, localMax, localStart, localEnd]);

  // Sync local state with global state when opening the filter dropdown
  React.useEffect(() => {
    if (isFilterOpen) {
      setLocalCategory(selectedCategory);
      setLocalSort(sortOrder);
      setLocalMin(minAmount);
      setLocalMax(maxAmount);
      setLocalStart(startDate);
      setLocalEnd(endDate);
    }
  }, [isFilterOpen, selectedCategory, sortOrder, minAmount, maxAmount, startDate, endDate]);

  const handleApplyFilters = () => {
    if (filterValidationError) return;

    setSelectedCategory(localCategory);
    setSortOrder(localSort);
    setMinAmount(localMin);
    setMaxAmount(localMax);
    setStartDate(localStart);
    setEndDate(localEnd);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    const defaults = { category: "All Categories", sort: "latest", val: "" };
    
    setLocalCategory(defaults.category);
    setLocalSort(defaults.sort);
    setLocalMin(defaults.val);
    setLocalMax(defaults.val);
    setLocalStart(defaults.val);
    setLocalEnd(defaults.val);

    setSelectedCategory(defaults.category);
    setSortOrder(defaults.sort);
    setMinAmount(defaults.val);
    setMaxAmount(defaults.val);
    setStartDate(defaults.val);
    setEndDate(defaults.val);
  };

  const handleExport = (format) => {
    if (!filteredTransactions || filteredTransactions.length === 0) return;
    
    const dataToExport = filteredTransactions.map(tx => ({
      ID: tx.id,
      Date: tx.date,
      Time: tx.time,
      Title: tx.title,
      Subtitle: tx.subtitle,
      Amount: tx.amount,
      RawValue: parsedAmount(tx.amount),
      Type: tx.type,
      Category: tx.category,
    }));

    let content, mimeType, extension;

    if (format === 'csv') {
      const headers = Object.keys(dataToExport[0]).join(',');
      const rows = dataToExport.map(obj => Object.values(obj).map(val => `"${val}"`).join(',')).join('\n');
      content = `${headers}\n${rows}`;
      mimeType = 'text/csv';
      extension = 'csv';
    } else {
      content = JSON.stringify(dataToExport, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zorvyn_export_${timestamp}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortOrder, minAmount, maxAmount, startDate, endDate]);

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const currentData = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const paginationItems = React.useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    const start = Math.max(2, currentPage - 1), end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) pages.push("...");
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages - 1) pages.push("...");
    return [...pages, totalPages];
  }, [currentPage, totalPages]);

  // Helper component for summary cards
  const SummaryCard = ({ label, value, border, children }) => (
    <div className={`bg-gray-50 dark:bg-slate-800 border-x border-y border-transparent dark:border-gray-700 p-5 rounded-lg border-l-4 ${border}`}>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] font-bold mb-2">{label}</p>
      {children || <p className={`text-2xl font-black tracking-tighter text-gray-800 dark:text-gray-100`}>{value}</p>}
    </div>
  );

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="pt-20 min-h-screen"
    >
      <div className="mx-auto w-full max-w-7xl px-8 pb-12 max-md:px-4">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold tracking-tighter text-gray-800 dark:text-gray-100 mb-1">Financial Ledger</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Real-time institutional transaction flow and audit trail.</p>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-1 items-center gap-4 min-w-[300px]">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by description or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </div>

            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-bold transition-all shadow-sm ${isFilterOpen || selectedCategory !== "All Categories" || minAmount || maxAmount || startDate || endDate ? "bg-primary/10 border-primary text-primary" : "bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                <span>Filters</span>
                {(selectedCategory !== "All Categories" || minAmount || maxAmount || startDate || endDate) && <span className="w-2 h-2 rounded-full bg-primary animate-pulse ml-0.5" />}
              </button>

              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-6 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-6">
                    {filterValidationError && (
                      <div className="bg-tertiary/10 border border-tertiary/50 text-tertiary px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 animate-in fade-in slide-in-from-top-1 px-3 py-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        {filterValidationError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Category</label>
                        <select value={localCategory} onChange={(e) => setLocalCategory(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition-colors cursor-pointer">
                          {categories.map((cat) => <option key={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Sort By</label>
                        <select value={localSort} onChange={(e) => setLocalSort(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition-colors cursor-pointer">
                          <option value="latest">Latest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="amount-high">Amount: High → Low</option>
                          <option value="amount-low">Amount: Low → High</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Amount Range ($)</label>
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <input type="number" min="0" placeholder="Min" value={localMin} onChange={(e) => setLocalMin(e.target.value)} className={`w-full min-w-0 bg-gray-50 dark:bg-slate-800 border rounded-lg px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 outline-none transition-all ${localMin && localMax && parseFloat(localMin) > parseFloat(localMax) ? "border-tertiary focus:border-tertiary" : "border-gray-200 dark:border-gray-700 focus:border-primary"}`} />
                        <span className="text-[10px] uppercase font-bold text-gray-400">to</span>
                        <input type="number" min="0" placeholder="Max" value={localMax} onChange={(e) => setLocalMax(e.target.value)} className={`w-full min-w-0 bg-gray-50 dark:bg-slate-800 border rounded-lg px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 outline-none transition-all ${localMin && localMax && parseFloat(localMin) > parseFloat(localMax) ? "border-tertiary focus:border-tertiary" : "border-gray-200 dark:border-gray-700 focus:border-primary"}`} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Date Range</label>
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <input type="date" value={localStart} onChange={(e) => setLocalStart(e.target.value)} className={`w-full min-w-0 bg-gray-50 dark:bg-slate-800 border rounded-lg px-3 py-2.5 text-[10px] text-gray-800 dark:text-gray-100 outline-none transition-all ${localStart && localEnd && new Date(localStart) > new Date(localEnd) ? "border-tertiary focus:border-tertiary" : "border-gray-200 dark:border-gray-700 focus:border-primary"}`} />
                        <span className="text-[10px] uppercase font-bold text-gray-400">to</span>
                        <input type="date" value={localEnd} onChange={(e) => setLocalEnd(e.target.value)} className={`w-full min-w-0 bg-gray-50 dark:bg-slate-800 border rounded-lg px-3 py-2.5 text-[10px] text-gray-800 dark:text-gray-100 outline-none transition-all ${localStart && localEnd && new Date(localStart) > new Date(localEnd) ? "border-tertiary focus:border-tertiary" : "border-gray-200 dark:border-gray-700 focus:border-primary"}`} />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                      <button onClick={handleApplyFilters} disabled={!!filterValidationError} className={`w-full py-3 rounded-lg text-xs font-bold transition-all ${filterValidationError ? "bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed" : "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"}`}>Apply Filters</button>
                      <button onClick={handleResetFilters} className="w-full py-2 text-xs font-black uppercase tracking-tighter text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-2">Reset All Filters</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2.5 rounded-lg font-bold text-sm shadow-sm flex items-center space-x-2 transition-all hover:bg-gray-50 dark:hover:bg-slate-800">
                <Download size={16} />
                <span>Export</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-1.5 z-50 overflow-hidden">
                <button onClick={() => handleExport('csv')} className="px-4 py-2 text-xs text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-bold transition-colors">Export as CSV</button>
                <button onClick={() => handleExport('json')} className="px-4 py-2 text-xs text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-bold transition-colors">Export as JSON</button>
              </div>
            </div>

            {activeRole === "Admin" && (
              <button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-95">
                <Plus size={16} />
                <span>Add Transaction</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-[10px] uppercase tracking-[0.15em] font-black text-gray-500 dark:text-gray-400">
            <div className="col-span-2">Date / Time</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 px-6">Category</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentData.map((tx) => (
              <div key={tx.id} className="grid grid-cols-12 px-6 py-5 items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {tx.date}
                  <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 uppercase">{tx.time}</span>
                </div>
                <div className="col-span-4 flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded border-l-2 flex items-center justify-center ${tx.iconBg.replace('/10', '/20')} ${tx.type === 'Credit' ? 'border-secondary/30' : 'border-tertiary/30'}`}>
                    {tx.type === "Credit" ? <TrendingUp size={14} className={tx.iconColor} /> : <TrendingDown size={14} className={tx.iconColor} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{tx.title}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{tx.subtitle}</p>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <p className={`text-sm font-black tracking-tight ${tx.amountColor}`}>{tx.amount}</p>
                  <p className={`text-[9px] uppercase font-bold opacity-60 ${tx.amountColor}`}>{tx.type}</p>
                </div>
                <div className="col-span-2 px-6">
                  <span className="px-3 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold uppercase tracking-widest border border-gray-200 dark:border-gray-600">{tx.category}</span>
                </div>
                <div className="col-span-2 flex justify-end space-x-1">
                  {activeRole === "Admin" ? (
                    <>
                      <button onClick={() => { setEditingTransaction(tx); setIsModalOpen(true); }} className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-all"><Pencil size={18} /></button>
                      <button onClick={() => deleteTransaction(tx.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-tertiary hover:bg-tertiary/10 rounded transition-all"><Trash2 size={18} /></button>
                    </>
                  ) : <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-widest">View Only</span>}
                </div>
              </div>
            ))}
            {currentData.length === 0 && <div className="p-12 text-center text-gray-500 dark:text-gray-400 text-sm">No transactions match the current filters.</div>}
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Showing {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} Transactions</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
              <div className="flex items-center gap-1">
                {paginationItems.map((item, idx) => item === "..." ? <span key={`ellipsis-${idx}`} className="w-8 text-center text-xs font-bold text-gray-400 dark:text-gray-500">...</span> : <button key={item} onClick={() => setCurrentPage(item)} className={`h-8 min-w-8 flex items-center justify-center rounded text-xs font-bold transition-all ${currentPage === item ? "bg-primary text-white shadow-lg" : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100"}`}>{item}</button>)}
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mt-8">
          <SummaryCard label="Total Monthly Flow" value={`$${(totals.inflow + totals.outflow).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} border="border-l-primary" />
          <SummaryCard label="Net Income" value={`$${totals.inflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} border="border-l-secondary" />
          <SummaryCard label="Operating Expenses" value={`$${totals.outflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} border="border-l-tertiary" />
          <SummaryCard label="Audit Compliance" border="border-l-outline dark:border-l-gray-600">
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tighter">{auditCompliance}%</p>
              <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${parseFloat(auditCompliance) > 90 ? "bg-secondary/20 text-secondary" : "bg-amber-500/20 text-amber-500"}`}>{parseFloat(auditCompliance) > 90 ? "Optimal" : "Review Needed"}</span>
            </div>
          </SummaryCard>
        </div>
      </div>
    </motion.main>
  );
};

export default Transactions;
