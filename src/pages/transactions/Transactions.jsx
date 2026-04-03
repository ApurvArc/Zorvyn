import React from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const Transactions = () => {
  const {
    activeRole,
    filteredTransactions,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortOrder,
    setSortOrder,
    deleteTransaction,
    setIsModalOpen,
    setEditingTransaction,
    totals,
    categories,
  } = useAppContext();

  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortOrder]);

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const currentData = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const paginationItems = React.useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push("...");
    for (let p = start; p <= end; p += 1) pages.push(p);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="pt-20 min-h-screen"
    >
      <div className="mx-auto w-full max-w-7xl px-8 pb-12 max-md:px-4">

        {/* Page Title + Filters */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tighter text-gray-800 dark:text-gray-100 mb-1">Financial Ledger</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Real-time institutional transaction flow and audit trail.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 ml-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-1 focus:ring-primary/40 focus:border-primary/40 min-w-[160px] appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 ml-1">Sort By</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-1 focus:ring-primary/40 focus:border-primary/40 min-w-[180px] appearance-none"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Amount: High → Low</option>
                <option value="amount-low">Amount: Low → High</option>
              </select>
            </div>
            {activeRole === "Admin" && (
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setIsModalOpen(true);
                }}
                className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-2.5 rounded-md font-bold text-sm shadow-[0_4px_20px_rgba(192,193,255,0.2)] flex items-center space-x-2 transition-all hover:translate-y-[-1px] active:scale-95 mt-5"
              >
                <Plus size={14} className="text-white" />
                <span>Add Transaction</span>
              </button>
            )}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-[10px] uppercase tracking-[0.15em] font-black text-gray-500 dark:text-gray-400">
            <div className="col-span-2">Date / Time</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 px-6">Category</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentData.map((tx) => (
              <div key={tx.id} className="grid grid-cols-12 px-6 py-5 items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {tx.date}
                  <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 uppercase">{tx.time}</span>
                </div>
                <div className="col-span-4 flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded border-l-2 flex items-center justify-center ${tx.iconBg.replace('bg-', 'bg-').replace('/10', '/20')} border-transparent`}>
                    {tx.type === "Credit" ? <TrendingUp size={14} className={tx.iconColor} /> : <TrendingDown size={14} className={tx.iconColor} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{tx.title}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{tx.subtitle}</p>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <p className={`text-sm font-black tracking-tight ${tx.amountColor}`}>{tx.amount}</p>
                  <p className={`text-[9px] uppercase font-bold ${tx.amountColor}/60`}>{tx.type}</p>
                </div>
                <div className="col-span-2 px-6">
                  <span className="px-3 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold uppercase tracking-widest border border-gray-200 dark:border-gray-600">{tx.category}</span>
                </div>
                <div className="col-span-2 flex justify-end space-x-1">
                  {activeRole === "Admin" ? (
                    <>
                      <button onClick={() => { setEditingTransaction(tx); setIsModalOpen(true); }} className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-all">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => deleteTransaction(tx.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-tertiary hover:bg-tertiary/10 rounded transition-all">
                        <Trash2 size={18} />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-widest">View Only</span>
                  )}
                </div>
              </div>
            ))}
            {currentData.length === 0 && (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400 text-sm">No transactions match the current filters.</div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">
              Showing {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} Transactions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="flex max-w-[320px] items-center gap-1 overflow-x-auto">
                {paginationItems.map((item, idx) => (
                  item === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 text-center text-xs font-bold text-gray-400 dark:text-gray-500"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`h-8 min-w-8 px-2 flex items-center justify-center rounded text-xs font-bold transition-all ${currentPage === item
                          ? "bg-primary text-white shadow-lg"
                          : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100"
                        }`}
                    >
                      {item}
                    </button>
                  )
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-6 mt-8">
          <div className="bg-gray-50 dark:bg-slate-800 border-x border-y border-transparent dark:border-gray-700 p-5 rounded-lg border-l-4 border-l-primary">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] font-bold mb-2">Total Monthly Flow</p>
            <p className="text-2xl font-black tracking-tighter text-gray-800 dark:text-gray-100">${(totals.inflow + totals.outflow).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800 border-x border-y border-transparent dark:border-gray-700 p-5 rounded-lg border-l-4 border-l-secondary">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] font-bold mb-2">Net Income</p>
            <p className="text-2xl font-black tracking-tighter text-secondary">${totals.inflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800 border-x border-y border-transparent dark:border-gray-700 p-5 rounded-lg border-l-4 border-l-tertiary">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] font-bold mb-2">Operating Expenses</p>
            <p className="text-2xl font-black tracking-tighter text-tertiary">${totals.outflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800 border-x border-y border-transparent dark:border-gray-700 p-5 rounded-lg border-l-4 border-l-outline dark:border-l-gray-600">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] font-bold mb-2">Audit Compliance</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tighter">99.8%</p>
              <span className="text-[9px] bg-secondary/20 text-secondary px-2 py-0.5 rounded font-bold uppercase">Optimal</span>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
};

export default Transactions;
