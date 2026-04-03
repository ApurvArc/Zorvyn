import React from "react";
import { motion } from "framer-motion";
import {
  Moon, Sun, ShieldCheck, Info,
  Smartphone, Monitor, Globe, Lock, Target
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const Settings = () => {
  const {
    activeRole, setActiveRole,
    theme, toggleTheme,
    userProfile, setUserProfile,
    savingsGoal, setSavingsGoal,
  } = useAppContext();

  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [draftProfile, setDraftProfile] = React.useState(userProfile);
  const [draftGoal, setDraftGoal] = React.useState(savingsGoal);

  // Security toggles (local UI state – in a real app these would persist)
  const [securityToggles, setSecurityToggles] = React.useState({
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: false,
    auditLog: true,
  });

  const toggleSecurity = (key) => {
    setSecurityToggles((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(`${next[key] ? "Enabled" : "Disabled"}: ${securityLabels[key]}`);
      return next;
    });
  };

  const securityLabels = {
    twoFactor: "Two-Factor Authentication",
    loginAlerts: "Login Alerts",
    sessionTimeout: "Auto Session Timeout (30 min)",
    auditLog: "Activity Audit Log",
  };

  const activeSessions = [
    { icon: Monitor, label: "Chrome — Windows 11", location: "New York, US", time: "Active now", current: true },
    { icon: Smartphone, label: "Safari — iPhone 15 Pro", location: "New York, US", time: "2 hours ago", current: false },
    { icon: Globe, label: "Firefox — macOS", location: "London, UK", time: "Yesterday", current: false },
  ];

  // Profile
  React.useEffect(() => {
    if (!isEditingProfile) setDraftProfile(userProfile);
  }, [userProfile, isEditingProfile]);

  const hasPendingChanges =
    isEditingProfile &&
    (draftProfile.fullName !== userProfile.fullName ||
      draftProfile.email !== userProfile.email ||
      draftProfile.bio !== userProfile.bio ||
      draftProfile.avatar !== userProfile.avatar);

  const hasGoalChange = draftGoal !== savingsGoal;

  const saveProfileChanges = () => {
    setUserProfile({
      fullName: draftProfile.fullName.trim() || userProfile.fullName,
      email: draftProfile.email.trim() || userProfile.email,
      bio: draftProfile.bio.trim() || userProfile.bio,
      avatar: draftProfile.avatar.trim() || userProfile.avatar,
    });
    if (hasGoalChange) setSavingsGoal(draftGoal);
    setIsEditingProfile(false);
    toast.success("Settings saved successfully");
  };

  const discardProfileChanges = () => {
    setDraftProfile(userProfile);
    setDraftGoal(savingsGoal);
    setIsEditingProfile(false);
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-screen bg-background pb-28 pt-20 text-on-background"
    >
      <div className="mx-auto w-full max-w-7xl px-8 pb-12 max-md:px-4">
        <header className="mb-8">
          <h2 className="mb-1 text-4xl font-extrabold tracking-tighter text-gray-800 dark:text-gray-100">
            Account Settings
          </h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Manage profile preferences, financial goals, and security controls.
          </p>
        </header>

        {/* Profile Header */}
        <section className="mb-10 flex flex-col items-end justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
              <img
                alt="Profile"
                className="relative h-28 w-28 rounded-xl border-2 border-primary/30 object-cover"
                src={isEditingProfile ? draftProfile.avatar : userProfile.avatar}
              />
            </div>
            <div>
              <h2 className="mb-2 text-5xl font-black tracking-tighter text-gray-800 dark:text-gray-100">
                {isEditingProfile ? draftProfile.fullName : userProfile.fullName}
              </h2>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-secondary" />
                  Node Online: US-EAST-01
                </span>
                <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-white/10" />
                <span>Last Auth: 4m ago</span>
              </div>
            </div>
          </div>

          <div className="flex rounded-lg border border-gray-200 bg-surface-container-lowest p-1 dark:border-gray-700">
            <button
              onClick={() => setActiveRole("Admin")}
              type="button"
              className={`rounded-md px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeRole === "Admin"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
              }`}
            >
              Admin Access
            </button>
            <button
              onClick={() => setActiveRole("Viewer")}
              type="button"
              className={`rounded-md px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeRole === "Viewer"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
              }`}
            >
              Viewer Only
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT: Profile + Financial Goals */}
          <div className="space-y-8 lg:col-span-2">
            {/* Account Management */}
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-surface-container p-8 dark:border-gray-700">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-500">
                  Account Management
                </h3>
                {isEditingProfile ? (
                  <button
                    type="button"
                    onClick={discardProfileChanges}
                    className="appearance-none rounded-md border border-gray-200 bg-transparent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-600 transition-colors hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancel Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setDraftProfile(userProfile); setIsEditingProfile(true); }}
                    className="rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-primary">Full Name</label>
                  <input
                    className={`w-full rounded-lg border-none bg-surface-container-lowest px-4 py-3 text-sm font-medium text-gray-800 transition-all dark:text-gray-100 ${isEditingProfile ? "focus:ring-1 focus:ring-primary/50" : "cursor-default"}`}
                    type="text"
                    value={draftProfile.fullName}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, fullName: e.target.value }))}
                    readOnly={!isEditingProfile}
                    tabIndex={isEditingProfile ? 0 : -1}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-primary">Email Identity</label>
                  <input
                    className={`w-full rounded-lg border-none bg-surface-container-lowest px-4 py-3 text-sm font-medium text-gray-800 transition-all dark:text-gray-100 ${isEditingProfile ? "focus:ring-1 focus:ring-primary/50" : "cursor-default"}`}
                    type="email"
                    value={draftProfile.email}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, email: e.target.value }))}
                    readOnly={!isEditingProfile}
                    tabIndex={isEditingProfile ? 0 : -1}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-primary">System Bio</label>
                  <textarea
                    className={`w-full resize-none rounded-lg border-none bg-surface-container-lowest px-4 py-3 text-sm font-medium text-gray-800 transition-all dark:text-gray-100 ${isEditingProfile ? "focus:ring-1 focus:ring-primary/50" : "cursor-default"}`}
                    rows={4}
                    readOnly={!isEditingProfile}
                    value={draftProfile.bio}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, bio: e.target.value }))}
                    tabIndex={isEditingProfile ? 0 : -1}
                  />
                </div>
                {isEditingProfile && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-primary">Profile Image URL</label>
                    <input
                      className="w-full rounded-lg border-none bg-surface-container-lowest px-4 py-3 text-sm font-medium text-gray-800 transition-all focus:ring-1 focus:ring-primary/50 dark:text-gray-100"
                      type="url"
                      value={draftProfile.avatar}
                      onChange={(e) => setDraftProfile((p) => ({ ...p, avatar: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <div className="flex items-center gap-3">
                      <label htmlFor="profile-image-upload" className="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 transition hover:text-gray-800 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-400 dark:hover:text-gray-100">
                        Upload Image
                      </label>
                      <input
                        id="profile-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === "string") {
                              setDraftProfile((p) => ({ ...p, avatar: reader.result }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">JPG, PNG, WEBP</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Goals */}
            <div className="rounded-xl border border-gray-200 bg-surface-container p-8 dark:border-gray-700">
              <div className="mb-6 flex items-center gap-3">
                <Target size={16} className="text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-500">
                  Financial Goals
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                Set your monthly savings target. This drives the <span className="text-primary font-bold">Savings Potential</span> panel and the savings rate signal in Insights.
              </p>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-primary">
                      Savings Target
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="80"
                        value={draftGoal}
                        onChange={(e) => setDraftGoal(Math.min(80, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-14 text-center rounded-md border border-gray-200 dark:border-gray-700 bg-surface-container-lowest px-2 py-1 text-sm font-black text-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="80"
                    value={draftGoal}
                    onChange={(e) => setDraftGoal(parseInt(e.target.value))}
                    className="w-full accent-primary h-1.5 rounded-full"
                  />
                  <div className="flex justify-between mt-1.5 text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase">
                    <span>1%</span>
                    <span className={draftGoal < 20 ? "text-tertiary" : draftGoal >= 30 ? "text-secondary" : "text-primary"}>
                      {draftGoal < 15 ? "Minimal" : draftGoal < 25 ? "Recommended" : draftGoal < 40 ? "Ambitious" : "Very Aggressive"}
                    </span>
                    <span>80%</span>
                  </div>
                </div>
                {hasGoalChange && (
                  <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
                    <Info size={14} className="text-primary flex-shrink-0" />
                    <p className="text-[10px] text-gray-600 dark:text-gray-400">
                      Goal changed from <span className="font-bold text-primary">{savingsGoal}%</span> to <span className="font-bold text-primary">{draftGoal}%</span>. Save to apply to Insights.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Display Preferences */}
            <div className="rounded-xl border border-gray-200 bg-surface-container p-8 dark:border-gray-700">
              <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-500">
                Display Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-surface-container-lowest px-5 py-4">
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-amber-400" />}
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Theme</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{theme === "dark" ? "Dark mode active" : "Light mode active"}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-all"
                  >
                    {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Security */}
          <div className="space-y-8">
            <div className="rounded-xl border border-gray-200 bg-surface-container p-8 dark:border-gray-700">
              <div className="mb-6 flex items-center gap-3">
                <Lock size={16} className="text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-500">
                  Security & Protocol
                </h3>
              </div>

              <div className="space-y-3">
                {Object.entries(securityToggles).map(([key, enabled]) => (
                  <div key={key} className={`flex items-center justify-between rounded-lg px-4 py-3 border transition-colors ${enabled ? "border-secondary/30 bg-secondary/5" : "border-gray-200 dark:border-gray-700 bg-surface-container-lowest"}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <ShieldCheck size={14} className={enabled ? "text-secondary flex-shrink-0" : "text-gray-400 flex-shrink-0"} />
                      <span className="text-[10px] font-bold text-gray-800 dark:text-gray-100 leading-tight">{securityLabels[key]}</span>
                    </div>
                    <button
                      onClick={() => toggleSecurity(key)}
                      className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors ml-3 ${enabled ? "bg-secondary" : "bg-gray-300 dark:bg-slate-600"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Sessions */}
            <div className="rounded-xl border border-gray-200 bg-surface-container p-8 dark:border-gray-700">
              <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-500">
                Active Sessions
              </h3>
              <div className="space-y-3">
                {activeSessions.map((session, i) => {
                  const Icon = session.icon;
                  return (
                    <div key={i} className={`rounded-lg px-4 py-3 border ${session.current ? "border-primary/30 bg-primary/5" : "border-gray-200 dark:border-gray-700 bg-surface-container-lowest"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <Icon size={14} className={session.current ? "text-primary flex-shrink-0 mt-0.5" : "text-gray-400 flex-shrink-0 mt-0.5"} />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-800 dark:text-gray-100 truncate">{session.label}</p>
                            <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">{session.location}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {session.current
                            ? <span className="text-[9px] font-bold text-secondary">● Online</span>
                            : <button onClick={() => toast.success("Session revoked")} className="text-[9px] font-bold text-tertiary hover:underline">Revoke</button>
                          }
                          <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">{session.time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => toast.success("All other sessions revoked")}
                className="mt-4 w-full text-center text-[10px] font-bold uppercase tracking-widest text-tertiary hover:opacity-80 transition-opacity py-2 rounded-lg border border-tertiary/20 hover:bg-tertiary/5"
              >
                Revoke All Other Sessions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Footer */}
      <footer
        className={`fixed bottom-0 left-64 right-0 z-40 flex items-center justify-between border-t border-gray-200 bg-white/90 px-12 py-4 backdrop-blur-xl dark:border-gray-700 dark:bg-slate-900/90 max-lg:left-0 max-md:flex-col max-md:items-start max-md:gap-4 max-md:px-4 ${
          hasPendingChanges || hasGoalChange ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
        } transition-all duration-300`}
      >
        <div className="flex items-center gap-4">
          <Info size={16} className="text-gray-500 dark:text-gray-500" />
          <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-500">
            {hasGoalChange && hasPendingChanges ? "Unsaved profile & goal changes" : hasGoalChange ? "Savings goal not yet applied" : "Unsaved profile changes detected"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={discardProfileChanges}
            className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={saveProfileChanges}
            className="rounded-sm bg-gradient-to-r from-primary to-primary-container px-10 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(192,193,255,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Save Changes
          </button>
        </div>
      </footer>
    </motion.main>
  );
};

export default Settings;
