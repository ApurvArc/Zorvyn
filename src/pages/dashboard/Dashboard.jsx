import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../../context/AppContext";

// Count-up hook: animates 0 → target on mount
const useCountUp = (target, duration = 1000) => {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setVal(Math.round(eased * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
};

const parseCardAmount = (str) =>
  Number(String(str || "").replace(/[^\d.]/g, "")) || 0;

const AnimatedCardValue = ({ amount, color }) => {
  const counted = useCountUp(parseCardAmount(amount));
  const prefix = String(amount || "").includes("+") ? "+ $" : "$";
  return (
    <span className={`text-4xl font-black tracking-tighter ${color}`}>
      {prefix}{counted.toLocaleString("en-US")}
    </span>
  );
};

const Dashboard = () => {
  const { dashboardCards, displayCategories, transactions, getCategoryColor, parsedAmount } = useAppContext();
  const [timeFilter, setTimeFilter] = React.useState("1M");
  const [hoveredPoint, setHoveredPoint] = React.useState(null);
  const [hoveredCategory, setHoveredCategory] = React.useState(null);
  const [drawKey, setDrawKey] = React.useState(0);
  const cardValueColors = {
    primary: "text-gray-800 dark:text-gray-100",
    secondary: "text-secondary",
    tertiary: "text-tertiary",
  };

  const getChartData = React.useCallback(() => {
    const txTimeline = transactions
      .map((tx) => ({
        date: new Date(tx.date),
        value: parsedAmount(tx.amount),
      }))
      .filter((tx) => !Number.isNaN(tx.date.getTime()))
      .sort((a, b) => a.date - b.date);

    const now = new Date();
    const latestTxDate = txTimeline.length ? txTimeline[txTimeline.length - 1].date : now;
    const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });
    const dayMonthFmt = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short" });
    const monthYearFmt = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

    const amountAtDate = (targetDate) =>
      txTimeline
        .filter((tx) => tx.date <= targetDate)
        .reduce((sum, tx) => sum + tx.value, 0);

    const buildForReference = (refDate) => {
      const lastNMonths = (n) =>
        Array.from({ length: n }, (_, i) => new Date(refDate.getFullYear(), refDate.getMonth() - (n - 1 - i), 1));

      const datesForFilter = () => {
        if (timeFilter === "1M") {
          return Array.from({ length: 30 }, (_, i) => {
            const d = new Date(refDate);
            d.setDate(refDate.getDate() - (29 - i));
            return d;
          });
        }
        if (timeFilter === "3M") return lastNMonths(3);
        if (timeFilter === "6M") return lastNMonths(6);
        if (timeFilter === "YTD") return Array.from({ length: 12 }, (_, i) => new Date(refDate.getFullYear(), i, 1));
        const earliestTxYear = txTimeline.length ? txTimeline[0].date.getFullYear() : refDate.getFullYear();
        return Array.from({ length: refDate.getFullYear() - earliestTxYear + 1 }, (_, i) => new Date(earliestTxYear + i, 0, 1));
      };

      const dates = datesForFilter();
      const amounts = dates.map((d) => amountAtDate(d));
      const minAmount = Math.min(...amounts, 0);
      const maxAmount = Math.max(...amounts, 1);
      const range = maxAmount - minAmount || 1;
      const normalized = amounts.map((val) => 0.18 + ((val - minAmount) / range) * 0.68);

      let axisLabels;
      if (timeFilter === "1M") {
        const tickIdx = [0, 5, 10, 15, 20, 25, 29];
        axisLabels = tickIdx.map((idx) => {
          const d = dates[idx];
          return `${String(d.getDate()).padStart(2, "0")} ${monthFmt.format(d).toUpperCase()}`;
        });
      } else if (timeFilter === "MAX") {
        axisLabels = dates.map((d) => String(d.getFullYear()));
      } else {
        axisLabels = dates.map((d) => monthFmt.format(d).toUpperCase());
      }

      const hoverLabels =
        timeFilter === "MAX"
          ? dates.map((d) => String(d.getFullYear()))
          : timeFilter === "1M"
            ? dates.map((d) => dayMonthFmt.format(d).toUpperCase())
            : dates.map((d) => monthYearFmt.format(d));

      return { dates, amounts, data: normalized, hoverLabels, axisLabels };
    };

    const currentWindow = buildForReference(now);
    const allFlat = currentWindow.amounts.every((v) => v === currentWindow.amounts[0]);
    if (allFlat && txTimeline.length) {
      return buildForReference(latestTxDate);
    }
    return currentWindow;
  }, [timeFilter, transactions]);

  const chartData = getChartData();
  React.useEffect(() => {
    setHoveredPoint(null);
    setDrawKey((k) => k + 1);
  }, [timeFilter]);
  const chartGeometry = React.useMemo(() => {
    const values = chartData.data;
    const paddingLeft = 0;
    const paddingRight = 0;
    const paddingTop = 10;
    const paddingBottom = 4;
    const width = 100;
    const height = 100;
    const bottomY = height - paddingBottom;

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;
    const usableWidth = width - paddingLeft - paddingRight;
    const usableHeight = height - paddingTop - paddingBottom;

    const points = values.map((value, index) => {
      const progress = values.length === 1 ? 0 : index / (values.length - 1);
      return {
        x: paddingLeft + progress * usableWidth,
        y: paddingTop + (1 - (value - minValue) / range) * usableHeight,
        value,
      };
    });

    if (points.length === 0) {
      return { points: [], linePath: "", areaPath: "", bottomY };
    }

    let linePath = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const curr = points[i];
      const controlX = (prev.x + curr.x) / 2;
      linePath += ` C ${controlX},${prev.y} ${controlX},${curr.y} ${curr.x},${curr.y}`;
    }

    const areaPath = `${linePath} L ${points[points.length - 1].x},${bottomY} L ${points[0].x},${bottomY} Z`;
    return { points, linePath, areaPath, bottomY };
  }, [chartData]);
  const activePointIndex = hoveredPoint;
  const activePoint = chartGeometry.points[activePointIndex];
  const activeValue = chartData.amounts[activePointIndex] || 0;
  const prevValue = chartData.amounts[Math.max(0, (activePointIndex ?? 0) - 1)] || activeValue;
  const deltaPct = prevValue === 0 ? 0 : ((activeValue - prevValue) / Math.abs(prevValue || 1)) * 100;
  const signedDelta = `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)}% Session`;
  const activeAmount = activeValue;

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen pt-20"
    >
      <div className="mx-auto w-full max-w-7xl px-8 pb-12 max-md:px-4">
        {/* Bento Grid: Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4, ease: "easeOut" }}
              className="p-6 rounded-xl relative overflow-hidden shadow-sm group bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700"
            >
              {card.icon && (
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl">{card.icon}</span>
                </div>
              )}
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">{card.title}</p>
              <div className="flex items-baseline space-x-1">
                <AnimatedCardValue amount={card.amount} color={cardValueColors[card.color] || "text-gray-800 dark:text-gray-100"} />
                <span className="text-xl font-bold text-gray-400 dark:text-gray-500">{card.decimal}</span>
              </div>
              <div className={`mt-4 flex items-center text-[10px] font-bold uppercase tracking-widest ${card.color === "primary" ? "text-secondary" : "text-gray-400 dark:text-gray-500"}`}>
                {card.trendIcon && <span className="material-symbols-outlined text-sm mr-1">{card.trendIcon}</span>}
                <span>{card.trendText}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Middle Row: Chart & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Balance Trend Chart */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Balance Trend</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio performance across major asset classes</p>
              </div>
              <div className="flex rounded-lg bg-surface-container-high p-1">
                {["1M", "3M", "6M", "YTD", "MAX"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-4 py-1 text-xs font-bold transition-all ${timeFilter === filter
                        ? "rounded bg-surface-container-lowest text-gray-800 shadow-sm dark:bg-slate-700 dark:text-gray-100"
                        : "text-gray-500 dark:text-gray-400"
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="group relative mt-6 h-[400px] w-full overflow-hidden" onMouseLeave={() => setHoveredPoint(null)}>
              {/* Line + Area + hover strips */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <linearGradient id="balanceAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#a3e635" stopOpacity="0.12" />
                    <stop offset="35%"  stopColor="#a3e635" stopOpacity="0.04" />
                    <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={chartGeometry.areaPath} fill="url(#balanceAreaFill)" />
                <motion.path
                  key={drawKey}
                  d={chartGeometry.linePath}
                  fill="none"
                  stroke="#a3e635"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
                />
                {/* Invisible vertical hover strips */}
                {chartGeometry.points.map((point, idx) => (
                  <rect
                    key={idx}
                    x={point.x - 2} y={0} width={4} height={100}
                    fill="transparent"
                    onMouseEnter={() => setHoveredPoint(idx)}
                  />
                ))}
                {/* Hover dot — inside SVG for perfect alignment with the line */}
                {activePoint && hoveredPoint !== null && (
                  <>
                    <line
                      x1={activePoint.x} y1={activePoint.y}
                      x2={activePoint.x} y2={chartGeometry.bottomY}
                      stroke="#a3e635" strokeOpacity="0.2" strokeWidth="0.4"
                      strokeDasharray="1 1"
                    />
                    <circle
                      cx={activePoint.x} cy={activePoint.y} r="1.6"
                      fill="#a3e635"
                      stroke="white" strokeWidth="0.5"
                    />
                  </>
                )}
              </svg>




              {/* Hover tooltip */}
              {chartGeometry.points.length > 0 && activePoint && hoveredPoint !== null && (
                <div
                  className="pointer-events-none absolute rounded-xl border border-white/10 bg-white/80 p-4 shadow-2xl backdrop-blur-xl dark:bg-slate-900/80"
                  style={{
                    left: `${Math.min(Math.max(activePoint.x + 4, 8), 72)}%`,
                    top: `${Math.max(activePoint.y - 20, 5)}%`,
                  }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {chartData.hoverLabels[activePointIndex]}
                  </p>
                  <p className="text-xl font-bold text-primary">
                    ${activeAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </p>
                  <p className={`text-xs font-bold ${deltaPct >= 0 ? "text-[#a3e635]" : "text-tertiary"}`}>
                    {signedDelta}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between px-2">
              {chartData.axisLabels.map((label, i) => (
                <span key={i} className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Spending Breakdown */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-black tracking-tight mb-0.5 text-gray-800 dark:text-gray-100">Breakdown</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Spending by category</p>

            {(() => {
              const cats = displayCategories;
              const totalAmount = cats.reduce((sum, cat) => sum + (cat.rawAmount || 0), 0);
              const palette = cats.map((cat) => getCategoryColor(cat.name));

              const radius = 39;
              const circumference = 2 * Math.PI * radius;
              const chartAngle = 270;
              const arcLength = (chartAngle / 360) * circumference;

              return (
                <div className="flex flex-col items-center flex-1 justify-center">
                  <div className="relative mb-8 mt-2 h-64 w-64">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform rotate-[135deg]">
                      {/* background track */}
                      <circle
                        cx="50" cy="50" r={radius}
                        fill="none"
                        stroke="rgba(128, 128, 128, 0.1)"
                        strokeWidth="11"
                        strokeLinecap="round"
                        strokeDasharray={`${arcLength} ${circumference}`}
                      />

                      {cats.map((cat, i) => {
                        const length = totalAmount > 0 ? (cat.rawAmount / totalAmount) * arcLength : 0;
                        const prevSum = cats.slice(0, i).reduce((sum, c) => sum + (c.rawAmount || 0), 0);
                        const finalOffset = -((prevSum / totalAmount) * arcLength);
                        const isInactive = hoveredCategory !== null && hoveredCategory !== i;
                        return (
                          <motion.circle
                            key={cat.name}
                            cx="50" cy="50" r={radius}
                            fill="none"
                            stroke={isInactive ? "var(--outline-variant)" : palette[i]}
                            strokeWidth="11"
                            strokeLinecap="round"
                            strokeDasharray={`${length} ${circumference}`}
                            initial={{ strokeDashoffset: arcLength }}
                            animate={{ strokeDashoffset: finalOffset }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                            style={{ filter: isInactive ? "saturate(0.2) brightness(0.9)" : "none", transition: "filter 0.4s, stroke 0.4s" }}
                            onMouseEnter={() => setHoveredCategory(i)}
                            onMouseLeave={() => setHoveredCategory(null)}
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[10px]">
                      <AnimatePresence mode="wait">
                        {hoveredCategory !== null ? (
                          <motion.div key={`cat-${hoveredCategory}`} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.15 }} className="flex flex-col items-center">
                            <p className="mb-1 text-[26px] font-black leading-none tracking-tight" style={{ color: palette[hoveredCategory % palette.length] }}>
                              ${(cats[hoveredCategory].rawAmount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold text-center truncate max-w-[80px]">
                              {cats[hoveredCategory].name}
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div key="total" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.15 }} className="flex flex-col items-center">
                            <p className="mb-1 text-[26px] font-black leading-none tracking-tight text-gray-800 dark:text-gray-100">
                              ${totalAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">TOTAL</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="w-full space-y-3 px-2 pr-1">
                    {cats.map((cat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 + 0.3, duration: 0.3, ease: "easeOut" }}
                        className={`flex justify-between items-center transition-all cursor-pointer ${hoveredCategory !== null && hoveredCategory !== i ? "opacity-40" : "opacity-100"}`}
                        onMouseEnter={() => setHoveredCategory(i)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: palette[i] }}></span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{cat.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100 tabular-nums">
                          ${(cat.rawAmount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Recent Transactions */}
        <section className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-800 dark:text-gray-100">Recent Transactions</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">Ledger Activity • Jun 2024</p>
            </div>
            <Link to="/transactions" className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">View All Entries</Link>
          </div>
          <div className="space-y-1">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded ${tx.iconBg.replace('bg-', 'bg-').replace('/10', '/20')} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${tx.iconColor}`}>{tx.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{tx.title}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">{tx.category} • {tx.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black tracking-tight ${tx.amountColor}`}>{tx.amount}</p>
                  <p className={`text-[9px] uppercase font-bold ${tx.amountColor}/60`}>{tx.type}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.main>
  );
};

export default Dashboard;


