import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const TransactionModal = () => {
  const { isModalOpen, setIsModalOpen, addTransaction, updateTransaction, editingTransaction, categories } = useAppContext();
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "Credit",
    category: "Operations"
  });
  const [newCategory, setNewCategory] = useState("");

  const categoryOptions = React.useMemo(() => {
    const existing = categories
      .filter((cat) => cat !== "All Categories")
      .filter(Boolean)
      .filter((cat) => cat !== "Other")
      .sort((a, b) => a.localeCompare(b));
    return [...Array.from(new Set(existing)), "Other"];
  }, [categories]);

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        title: editingTransaction.title || "",
        amount: String(editingTransaction.amount).replace(/[^0-9.]/g, ""),
        type: editingTransaction.type || "Credit",
        category: editingTransaction.category || "Operations",
      });
      setNewCategory("");
    } else {
      const defaultCategory = categoryOptions.includes("Operations")
        ? "Operations"
        : (categoryOptions[0] || "Other");
      setFormData({ title: "", amount: "", type: "Credit", category: defaultCategory });
      setNewCategory("");
    }
  }, [editingTransaction, isModalOpen, categoryOptions]);

  if (!isModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCategory =
      formData.category === "__new__"
        ? (newCategory.trim() || "Other")
        : formData.category;
    const parsedAmount = parseFloat(formData.amount) || 0;
    const formattedAmount = formData.type === "Credit"
      ? `+ $${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `- $${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const baseTxData = {
      title: formData.title || (editingTransaction ? "Updated Transaction" : "New Transaction"),
      amount: formattedAmount,
      type: formData.type,
      category: finalCategory,
      icon: formData.type === "Credit" ? "trending_up" : "trending_down",
      iconColor: formData.type === "Credit" ? "text-secondary" : "text-tertiary",
      iconBg: formData.type === "Credit"
        ? "bg-secondary/10 border-secondary shadow-[0_0_10px_rgba(78,222,163,0.1)]"
        : "bg-tertiary/10 border-tertiary shadow-[0_0_10px_rgba(255,179,173,0.1)]",
      amountColor: formData.type === "Credit" ? "text-secondary" : "text-tertiary",
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, baseTxData);
    } else {
      addTransaction({
        ...baseTxData,
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        subtitle: "Manual Entry",
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-8 shadow-2xl border border-gray-200 dark:border-gray-700 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{editingTransaction ? "Edit Transaction" : "Add Transaction"}</h2>
          <button onClick={() => setIsModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-1">Description</label>
            <input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
              placeholder="e.g. Server Hosting"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-1">Amount ($)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary appearance-none"
              >
                <option value="Credit">Credit (+)</option>
                <option value="Debit">Debit (-)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary appearance-none"
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__new__">+ Add New Category</option>
            </select>
          </div>

          {formData.category === "__new__" && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-1">
                New Category Name
              </label>
              <input
                required
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
                placeholder="e.g. Marketing"
              />
            </div>
          )}

          <button type="submit" className="w-full mt-6 bg-gradient-to-br from-primary to-primary-container text-white font-bold py-3 rounded-lg text-sm shadow-[0_4px_20px_rgba(192,193,255,0.2)] hover:scale-[1.02] transition-transform">
            {editingTransaction ? "Save Changes" : "Save Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
