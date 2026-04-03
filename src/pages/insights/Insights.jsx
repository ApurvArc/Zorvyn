import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, CheckCircle, AlertTriangle, Activity, PiggyBank, ArrowRight } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const Insights = () => {
  const { spendingCategories, totals, savingsPotential, flowComparison, signals, topSpendCategory, savingsGoal } = useAppContext();
  const [hoveredFlow, setHoveredFlow] = React.useState(null);
  const [hoveredCategory, setHoveredCategory] = React.useState(null);
  const OTHER_COLOR = "#94a3b8";
  const getCategoryColor = React.useCallback((name) => {
    const key = String(name || "Other").trim();
    if (key.toLowerCase() === "other") return OTHER_COLOR;
    const hash = [...key].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0);
    const hue = hash % 360;
    return `hsl(${hue} 72% 56%)`;
  }, []);
  const displayCategories = React.useMemo(() => {
    return [...spendingCategories]
      .map((cat) => ({
        ...cat,
        name: cat.name || "Other",
      }))
      .sort((a, b) => (b.rawAmount || 0) - (a.rawAmount || 0));
  }, [spendingCategories]);

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-screen pt-20"
    >
      <div className="mx-auto w-full max-w-7xl space-y-8 px-8 pb-12 max-md:px-4">
        <header>
          <h2 className="text-4xl font-bold tracking-tighter text-gray-800 dark:text-gray-100 mb-1">Financial Intelligence</h2>
          <p className="text-gray-500 dark:text-gray-400 font-label tracking-wide uppercase text-xs">Real-time algorithmic observations</p>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* Critical Expense Card — driven by topSpendCategory */}
          <div className="col-span-12 md:col-span-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(192,193,255,0.5)]"></div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-1">Top Expense Category</span>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {topSpendCategory ? topSpendCategory.name : "—"}
                </h3>
              </div>
              {topSpendCategory && topSpendCategory.pctOfOutflow > 40
                ? <AlertTriangle size={28} className="text-tertiary" />
                : <Building2 size={28} className="text-primary" />
              }
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-black tracking-tight text-gray-800 dark:text-gray-100">
                {topSpendCategory
                  ? `$${Math.floor(topSpendCategory.amount).toLocaleString("en-US")}`
                  : "$0"}
                <span className="text-xl font-normal text-gray-500 dark:text-gray-400">.00</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {topSpendCategory
                  ? `${topSpendCategory.pctOfOutflow}% of total outflow`
                  : "No expense data"}
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center text-xs font-bold"
              style={{ color: topSpendCategory?.pctOfOutflow > 40 ? "var(--color-tertiary)" : "var(--color-secondary)" }}>
              <CheckCircle size={14} className="mr-1" />
              {topSpendCategory?.pctOfOutflow > 40 ? "High concentration — consider rebalancing" : "Within normal allocation range"}
            </div>
          </div>

          {/* Flow Comparison Chart — driven by computed weekly data */}
          <div className="col-span-12 md:col-span-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Weekly Outflow Comparison</h3>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center justify-center text-gray-500 dark:text-gray-400"><span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></span> Prior Week</div>
                <div className="flex items-center justify-center text-gray-800 dark:text-gray-100"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span> Current Week</div>
              </div>
            </div>
            <div className="flex-1 flex items-end justify-between px-4">
              {flowComparison.map((flow, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center group w-full px-2 relative cursor-pointer"
                  onMouseEnter={() => setHoveredFlow(i)}
                  onMouseLeave={() => setHoveredFlow(null)}
                >
                  {hoveredFlow === i && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-slate-700 text-white text-[10px] font-bold px-3 py-2 rounded-md shadow-xl whitespace-nowrap z-10 border border-gray-200 dark:border-gray-600 flex flex-col items-center gap-1">
                      <span className="text-gray-300 dark:text-gray-400 font-normal">{flow.week}</span>
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>{flow.lastLabel}</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>{flow.thisLabel}</span>
                      </div>
                    </div>
                  )}
                  <div className={`w-full flex justify-center space-x-1 items-end h-40 transition-opacity ${hoveredFlow !== null && hoveredFlow !== i ? "opacity-30" : "opacity-100"}`}>
                    <div className="w-4 bg-gray-200 dark:bg-gray-700 rounded-t-sm transition-all duration-300 group-hover:bg-gray-300 dark:group-hover:bg-gray-600" style={{ height: flow.lastMonth }}></div>
                    <div className={`w-4 bg-primary rounded-t-sm transition-all duration-300 group-hover:brightness-125 ${flow.pulse ? "animate-pulse" : ""}`} style={{ height: flow.thisMonth }}></div>
                  </div>
                  <span className={`mt-4 text-[10px] font-bold uppercase transition-colors ${hoveredFlow === i ? "text-gray-800 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}>{flow.week}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signals — dynamically generated from transaction patterns */}
          <div className="col-span-12 md:col-span-7 grid grid-cols-1 gap-6">
            {signals.map((signal, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${signal.bgColor}`}>
                  <div className={`flex items-center justify-center ${signal.iconColor}`}>
                    <Activity size={18} />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">{signal.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    {signal.description.split(signal.highlight).map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span className={signal.highlightClass}>{signal.highlight}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Savings Potential */}
          <div className="col-span-12 md:col-span-5 bg-gray-50 dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <PiggyBank size={18} className="text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Savings Potential</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Total Inflow</span>
                  <span className="text-gray-800 dark:text-gray-100 font-mono">${savingsPotential.inflow.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Target Retention ({savingsGoal}%)</span>
                  <span className="text-gray-800 dark:text-gray-100 font-mono">${savingsPotential.retention.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Total Outflow</span>
                  <span className="text-tertiary font-mono">${totals.outflow.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 dark:text-gray-100 font-bold">Remaining Capacity</span>
                  <span className={`text-2xl font-black tracking-tight ${savingsPotential.capacity >= 0 ? "text-secondary" : "text-tertiary"}`}>
                    ${Math.abs(totals.inflow - totals.outflow - totals.inflow * 0.2).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full mt-8 py-3 bg-primary-container rounded-md text-sm font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-95">
              Allocate to Vault
            </button>
          </div>

          {/* Category Breakdown */}
          <div className="col-span-12 bg-white dark:bg-slate-900 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Category Breakdown</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-label mt-1">Allocation by percentage of total outflow</p>
              </div>
              <Link to="/transactions" className="text-primary text-xs font-bold uppercase tracking-widest flex items-center hover:opacity-80">
                View Full Ledger <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayCategories.map((cat, idx) =>
                (() => {
                  const displayName = cat.name;
                  const accent = getCategoryColor(cat.name);
                  return (
                    <div
                      key={idx}
                      className={`space-y-4 p-4 rounded-xl transition-all cursor-pointer ${hoveredCategory === idx ? "bg-gray-100 dark:bg-slate-800/50 scale-[1.02] shadow-sm" : (hoveredCategory !== null ? "opacity-40" : "hover:bg-gray-50 dark:hover:bg-slate-800/20")}`}
                      onMouseEnter={() => setHoveredCategory(idx)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <div className="flex justify-between items-end">
                        <span
                          className="text-sm font-bold"
                          style={{ color: accent }}
                        >
                          {displayName}
                        </span>
                        <div className="flex items-baseline gap-2">
                          {hoveredCategory === idx && <span className="text-xs text-gray-400 font-medium">{cat.amount}</span>}
                          <span
                            className={`text-sm font-semibold`}
                            style={{ color: accent }}
                          >
                            {cat.value}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ease-out ${hoveredCategory === idx ? "brightness-125" : ""}`}
                          style={{ width: cat.value, backgroundColor: accent }}
                        />
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
};

export default Insights;
