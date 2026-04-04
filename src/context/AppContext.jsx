import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { TRANSACTIONS_DATA } from "../assets/assets";

export const AppContext = createContext();
const THEME_KEY = "theme";
const ACTIVE_ROLE_KEY = "activeRole";
const USER_PROFILE_KEY = "userProfile";
const SAVINGS_GOAL_KEY = "savingsGoal";
const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};
const ROLES = {
  ADMIN: "Admin",
  VIEWER: "Viewer",
};
const DEFAULT_USER_PROFILE = {
  fullName: "Apurv Rameshwer Choudhary",
  email: "apurvjaishwal19mar@gmail.com",
  bio: "Final-year ECE student with strong foundations in Data Structures, Algorithms, and MERN stack development. Experienced in building scalable SaaS and backend systems. Interested in backend engineering, AI-driven applications, and solving real-world problems.",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDBL9EcpXv-1cpjwpteb-WZBrbXZqUDwip4kixBP64L_2LaGw8lGVpgpYOBVwShiLArQr_jbr-ungIDzy6VhG82K6r7ZcE-zMAI-_4r2kS9P6dcn-PZuIyQwq4VVOk-tRDas8FOyfyM69larlcy14SzkNf-YXojmyygphO4ddg__GByZIkP2IUTgZNdhIVFOTcxpN-mrUIbXvxzepj9ukkTdZtANC8I-Cia2XmH3Jn0N-1dwrMj8l117QmfDgrMRNWKB6uaM0ZAU2mc",
};

export const AppProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState(() => {
    const savedRole = localStorage.getItem(ACTIVE_ROLE_KEY);
    if (savedRole === ROLES.ADMIN || savedRole === ROLES.VIEWER) {
      return savedRole;
    }
    return ROLES.ADMIN;
  });
  const [transactions, setTransactions] = useState(TRANSACTIONS_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortOrder, setSortOrder] = useState("latest");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === THEMES.DARK || savedTheme === THEMES.LIGHT) {
      return savedTheme;
    }
    return THEMES.LIGHT;
  });

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_PROFILE_KEY);
      if (!saved) return DEFAULT_USER_PROFILE;
      const parsed = JSON.parse(saved);
      return {
        fullName: parsed?.fullName || DEFAULT_USER_PROFILE.fullName,
        email: parsed?.email || DEFAULT_USER_PROFILE.email,
        bio: parsed?.bio || DEFAULT_USER_PROFILE.bio,
        avatar: parsed?.avatar || DEFAULT_USER_PROFILE.avatar,
      };
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "System Alert",
      title: "Unusual Login Attempt",
      desc: "Blocked an anomalous login attempt from IP 192.168.4.1 outside normal geofence patterns.",
      time: "12 mins ago",
      isRead: false,
      color: "text-secondary",
    },
    {
      id: 2,
      type: "Treasury update",
      title: "Yield Target Reached",
      desc: "Vault liquidity has grown beyond $45k, meeting the Phase 1 target retention logic!",
      time: "2 hours ago",
      isRead: false,
      color: "text-primary",
    },
  ]);
  const [savingsGoal, setSavingsGoalState] = useState(() => {
    const saved = localStorage.getItem(SAVINGS_GOAL_KEY);
    const parsed = parseInt(saved, 10);
    return !isNaN(parsed) && parsed >= 1 && parsed <= 80 ? parsed : 20;
  });
  const setSavingsGoal = (val) => {
    const clamped = Math.min(80, Math.max(1, parseInt(val, 10) || 20));
    setSavingsGoalState(clamped);
    localStorage.setItem(SAVINGS_GOAL_KEY, String(clamped));
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
      localStorage.setItem(THEME_KEY, newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    if (theme === THEMES.DARK) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, [theme]);


  useEffect(() => {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_ROLE_KEY, activeRole);
  }, [activeRole]);

  // --- Transaction CRUD ---
  const addTransaction = (transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  };

  const updateTransaction = (id, payload) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...payload } : tx))
    );
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  // --- Amount parser: handles "- $2,490.00" and "+ $14,205.42" formats ---
  const parsedAmount = (amountStr) => {
    const isDebit = amountStr.trim().startsWith("-");
    const num = Number(amountStr.replace(/[^\d.]/g, ""));
    return isDebit ? -num : num;
  };

  const getCategoryColor = (name) => {
    const key = String(name || "Other").trim();
    if (key.toLowerCase() === "other") return "#94a3b8";
    const hash = [...key].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0);
    const hue = hash % 360;
    return `hsl(${hue} 72% 56%)`;
  };

  const parseTxDate = (dateStr) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [monthDay, year] = dateStr.split(", ");
    const [month, day] = monthDay.split(" ");
    return new Date(parseInt(year), months.indexOf(month), parseInt(day));
  };

  // --- Derived: totals ---
  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const val = parsedAmount(tx.amount);
        if (val > 0) acc.inflow += val;
        else acc.outflow += Math.abs(val);
        return acc;
      },
      { inflow: 0, outflow: 0 }
    );
  }, [transactions]);

  // --- Derived: expense map (shared between breakdown and insights) ---
  const expenseMap = useMemo(() => {
    const map = {};
    transactions.forEach((tx) => {
      const val = parsedAmount(tx.amount);
      if (val < 0) map[tx.category] = (map[tx.category] || 0) + Math.abs(val);
    });
    return map;
  }, [transactions]);

  // --- Derived: dashboard summary cards ---
  const dashboardCards = useMemo(
    () => [
      {
        title: "Total Vault Balance",
        amount: `$${(totals.inflow - totals.outflow).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
        decimal: ".00",
        icon: "account_balance_wallet",
        trendText: "+2.4% from last month",
        trendIcon: "trending_up",
        color: "primary",
        bgColor: "",
        border: "",
      },
      {
        title: "Monthly Inflow",
        amount: `$${totals.inflow.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
        decimal: ".00",
        icon: null,
        trendText: "Target: $250,000",
        trendIcon: null,
        color: "secondary",
        bgColor: "",
        border: "border-l-2 border-secondary",
      },
      {
        title: "Monthly Outflow",
        amount: `$${totals.outflow.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
        decimal: ".00",
        icon: null,
        trendText: `${totals.inflow > 0 ? Math.round((totals.outflow / totals.inflow) * 100) : 0}% of income`,
        trendIcon: null,
        color: "tertiary",
        bgColor: "",
        border: "border-l-2 border-tertiary",
      },
    ],
    [totals]
  );

  // --- Derived: spending by category (from debit transactions) ---
  const spendingCategories = useMemo(() => {
    const totalExpenses = Object.values(expenseMap).reduce((s, v) => s + v, 0);

    const sorted = Object.entries(expenseMap)
      .map(([name, val]) => ({
        name,
        rawAmount: val,
        percentage: totalExpenses === 0 ? 0 : val / totalExpenses,
        amount: `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      }))
      .sort((a, b) => b.rawAmount - a.rawAmount);

    const COLORS = ["#4edea3", "#6366f1", "#60a5fa", "#f59e0b", "#f87171"];
    const BAR_COLORS = ["bg-primary", "bg-secondary", "bg-blue-400", "bg-amber-400", "bg-tertiary"];

    return sorted.map((item, idx) => ({
      ...item,
      percentage: `${Math.round(item.percentage * 100)}%`,
      value: `${Math.round(item.percentage * 100)}%`,
      barColor: BAR_COLORS[idx % BAR_COLORS.length],
      hexColor: COLORS[idx % COLORS.length],
    }));
  }, [expenseMap]);

  // --- Derived: sorted display categories (used in Dashboard & Insights) ---
  const displayCategories = useMemo(() => {
    return spendingCategories.map(cat => ({ ...cat, name: cat.name || "Other" }))
      .sort((a, b) => (b.rawAmount || 0) - (a.rawAmount || 0));
  }, [spendingCategories]);

  // --- Derived: filtered transactions for ledger ---
  const filteredTransactions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const parseInputDate = (dateStr) => {
      if (!dateStr) return null;
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d);
    };

    const startD = parseInputDate(startDate);
    const endD = parseInputDate(endDate);

    const filtered = transactions.filter((tx) => {
      const matchesSearch =
        !q ||
        tx.title.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "All Categories" || tx.category === selectedCategory;

      const amt = Math.abs(parsedAmount(tx.amount));
      const matchesMinAmount = minAmount === "" || amt >= parseFloat(minAmount);
      const matchesMaxAmount = maxAmount === "" || amt <= parseFloat(maxAmount);

      const txDate = parseTxDate(tx.date);
      const matchesStartDate = !startD || txDate >= startD;
      const matchesEndDate = !endD || txDate <= endD;

      return matchesSearch && matchesCategory && matchesMinAmount && matchesMaxAmount && matchesStartDate && matchesEndDate;
    });

    return filtered.sort((a, b) => {
      const dateA = parseTxDate(a.date);
      const dateB = parseTxDate(b.date);

      if (sortOrder === "latest") return dateB - dateA;
      if (sortOrder === "oldest") return dateA - dateB;

      const aAmt = Math.abs(parsedAmount(a.amount));
      const bAmt = Math.abs(parsedAmount(b.amount));
      if (sortOrder === "amount-high") return bAmt - aAmt;
      if (sortOrder === "amount-low") return aAmt - bAmt;
      return 0;
    });
  }, [transactions, searchTerm, selectedCategory, sortOrder, minAmount, maxAmount, startDate, endDate]);

  // --- Derived: dynamic categories list from transactions ---
  const categories = useMemo(() => {
    const cats = [...new Set(transactions.map((tx) => tx.category))];
    return ["All Categories", ...cats.sort()];
  }, [transactions]);

  // --- Derived: insights savings ---
  const savingsPotential = useMemo(() => ({
    inflow: totals.inflow,
    retention: totals.inflow * (savingsGoal / 100),
    capacity: totals.inflow - totals.outflow - totals.inflow * (savingsGoal / 100),
  }), [totals, savingsGoal]);

  // --- Derived: top spending category (for insights critical expense card) ---
  const topSpendCategory = useMemo(() => {
    if (Object.keys(expenseMap).length === 0) return null;
    const top = Object.entries(expenseMap).sort((a, b) => b[1] - a[1])[0];
    const totalOut = totals.outflow || 1;
    return {
      name: top[0],
      amount: top[1],
      formattedAmount: `$${top[1].toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      pctOfOutflow: Math.round((top[1] / totalOut) * 100),
    };
  }, [expenseMap, totals.outflow]);

  // --- Derived: weekly flow comparison (last 8 weeks: current vs. prior) ---
  const flowComparison = useMemo(() => {
    const now = new Date();
    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - w * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);

      const prevWeekEnd = new Date(weekStart);
      prevWeekEnd.setDate(weekStart.getDate() - 1);
      const prevWeekStart = new Date(prevWeekEnd);
      prevWeekStart.setDate(prevWeekEnd.getDate() - 6);

      let thisOut = 0, lastOut = 0;
      transactions.forEach((tx) => {
        const val = parsedAmount(tx.amount);
        if (val >= 0) return;
        const txDate = parseTxDate(tx.date);
        if (txDate >= weekStart && txDate <= weekEnd) thisOut += Math.abs(val);
        if (txDate >= prevWeekStart && txDate <= prevWeekEnd) lastOut += Math.abs(val);
      });

      weeks.push({ thisOut, lastOut });
    }

    const maxVal = Math.max(...weeks.map((w) => Math.max(w.thisOut, w.lastOut)), 1);
    const toHeight = (v) => `${Math.round((v / maxVal) * 130) + 10}px`;
    const toLabel = (v) => `$${(v / 1000).toFixed(1)}k`;
    const weekLabels = ["W1", "W2", "W3", "W4"];

    return weeks.map((w, i) => ({
      week: weekLabels[i],
      thisMonth: toHeight(w.thisOut),
      lastMonth: toHeight(w.lastOut),
      thisLabel: toLabel(w.thisOut),
      lastLabel: toLabel(w.lastOut),
      pulse: i === weeks.length - 1 && w.thisOut > w.lastOut,
    }));
  }, [transactions]);

  // --- Derived: dynamic signals from transaction patterns ---
  const signals = useMemo(() => {
    const result = [];
    if (transactions.length === 0) return result;

    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 6);
    const prevWeekStart = new Date(now);
    prevWeekStart.setDate(now.getDate() - 13);
    const prevWeekEnd = new Date(now);
    prevWeekEnd.setDate(now.getDate() - 7);

    let thisWeekSpend = 0, prevWeekSpend = 0;
    transactions.forEach((tx) => {
      const val = parsedAmount(tx.amount);
      if (val >= 0) return;
      const d = parseTxDate(tx.date);
      if (d >= thisWeekStart) thisWeekSpend += Math.abs(val);
      else if (d >= prevWeekStart && d <= prevWeekEnd) prevWeekSpend += Math.abs(val);
    });

    // Signal 1: spending velocity vs prior week
    if (prevWeekSpend > 0) {
      const pct = Math.round(((thisWeekSpend - prevWeekSpend) / prevWeekSpend) * 100);
      const isHigher = pct > 0;
      result.push({
        iconColor: isHigher ? "text-tertiary" : "text-secondary",
        bgColor: isHigher ? "bg-tertiary/10" : "bg-secondary/10",
        title: isHigher ? "Elevated Spend Velocity" : "Spending Slowing Down",
        description: `Outflow is ${Math.abs(pct)}% ${isHigher ? "higher" : "lower"} this week vs. last week.`,
        highlight: `${Math.abs(pct)}% ${isHigher ? "higher" : "lower"}`,
        highlightClass: isHigher ? "text-tertiary font-bold" : "text-secondary font-bold",
      });
    } else {
      result.push({
        iconColor: "text-primary",
        bgColor: "bg-primary/10",
        title: "No Comparison Data",
        description: "Not enough weekly history to compare spending velocity yet.",
        highlight: "weekly history",
        highlightClass: "text-primary font-bold",
      });
    }

    // Signal 2: savings rate
    const savingsRate = totals.inflow > 0
      ? Math.round(((totals.inflow - totals.outflow) / totals.inflow) * 100)
      : 0;
    const isHealthy = savingsRate >= savingsGoal;
    result.push({
      iconColor: isHealthy ? "text-secondary" : "text-amber-500",
      bgColor: isHealthy ? "bg-secondary/10" : "bg-amber-500/10",
      title: isHealthy ? "Healthy Savings Rate" : "Savings Rate Below Target",
      description: `Net savings rate is ${savingsRate}% of total inflow. Your target is ${savingsGoal}%.`,
      highlight: `${savingsRate}%`,
      highlightClass: isHealthy ? "text-secondary font-bold" : "text-amber-500 font-bold",
    });

    // Signal 3: top category dominance
    if (topSpendCategory) {
      const isOverloaded = topSpendCategory.pctOfOutflow > 40;
      result.push({
        iconColor: isOverloaded ? "text-tertiary" : "text-primary",
        bgColor: isOverloaded ? "bg-tertiary/10" : "bg-primary/10",
        title: isOverloaded ? `${topSpendCategory.name} Dominates Outflow` : `Top Expense: ${topSpendCategory.name}`,
        description: `${topSpendCategory.name} accounts for ${topSpendCategory.pctOfOutflow}% of all outflow at ${topSpendCategory.formattedAmount}.`,
        highlight: `${topSpendCategory.pctOfOutflow}%`,
        highlightClass: isOverloaded ? "text-tertiary font-bold" : "text-primary font-bold",
      });
    }

    return result;
  }, [transactions, totals, topSpendCategory, savingsGoal]);

  const value = {
    // State
    activeRole,
    setActiveRole,
    transactions,
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
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isModalOpen,
    setIsModalOpen,
    editingTransaction,
    setEditingTransaction,
    theme,
    setTheme,
    toggleTheme,
    notifications,
    setNotifications,
    userProfile,
    setUserProfile,

    // Utility
    parsedAmount,
    getCategoryColor,

    // CRUD
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Derived financial data
    totals,
    dashboardCards,
    spendingCategories,
    displayCategories,
    filteredTransactions,
    categories,
    savingsPotential,
    savingsGoal,
    setSavingsGoal,
    topSpendCategory,
    flowComparison,
    signals,
    auditCompliance: useMemo(() => {
      if (transactions.length === 0) return 100;
      const valid = transactions.filter(tx => tx.category && tx.category !== "Other" && tx.category !== "Operations").length;
      const score = (valid / transactions.length) * 100;
      return score.toFixed(1);
    }, [transactions]),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
