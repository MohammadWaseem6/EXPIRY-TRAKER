import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Settings as SettingsIcon,
  Bell,
  Download,
  User,
  Check,
  Database,
  RefreshCw,
  Save,
  Palette,
  FileText,
} from "lucide-react";
import { COLORS } from "../theme";
import { exportItemsToCSV } from "../utils/exportCSV";

const STORAGE_KEY = "storeops_settings";

const DEFAULTS = {
  lowStockThreshold: 5,
  expiryWarningDays: 3,
  emailAlerts: true,
  currency: "USD",
  theme: "dark",
  compactView: false,
  autoRefresh: true,
};

const loadSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};

const Panel = ({ children, className = "" }) => (
  <div
    className={`rounded-xl p-5 ${className}`}
    style={{
      background: COLORS.panel,
      border: `1px solid ${COLORS.panelBorder}`,
    }}
  >
    {children}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div
    className="flex items-center justify-between py-3 border-b border-opacity-20"
    style={{ borderBottom: `1px solid ${COLORS.grid}` }}
  >
    <div>
      <p className="text-sm font-medium" style={{ color: COLORS.text }}>
        {label}
      </p>
      {hint && (
        <p className="text-xs mt-0.5" style={{ color: COLORS.sub }}>
          {hint}
        </p>
      )}
    </div>
    {children}
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-3">
    <span
      className="text-xs"
      style={{ color: checked ? COLORS.success : COLORS.sub }}
    >
      {checked ? "On" : "Off"}
    </span>
    <button
      onClick={() => onChange(!checked)}
      className="w-11 h-6 rounded-full relative transition-all duration-200"
      style={{ background: checked ? COLORS.active : COLORS.grid }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: checked ? "22px" : "2px" }}
      />
    </button>
  </div>
);

const NumberInput = ({ value, onChange, min = 0, suffix }) => (
  <div className="flex items-center gap-2">
    <input
      type="number"
      min={min}
      value={value}
      onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
      className="w-20 px-3 py-1.5 rounded-lg text-sm text-right outline-none transition focus:ring-2"
      style={{
        background: COLORS.bg,
        border: `1px solid ${COLORS.panelBorder}`,
        color: COLORS.text,
        width: "70px",
      }}
      onFocus={(e) => (e.target.style.borderColor = COLORS.active)}
      onBlur={(e) => (e.target.style.borderColor = COLORS.panelBorder)}
    />
    {suffix && (
      <span className="text-xs" style={{ color: COLORS.sub }}>
        {suffix}
      </span>
    )}
  </div>
);

const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-3 py-1.5 rounded-lg text-sm outline-none transition focus:ring-2"
    style={{
      background: COLORS.bg,
      border: `1px solid ${COLORS.panelBorder}`,
      color: COLORS.text,
    }}
    onFocus={(e) => (e.target.style.borderColor = COLORS.active)}
    onBlur={(e) => (e.target.style.borderColor = COLORS.panelBorder)}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const SettingsView = ({ items = [] }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("general");

  useEffect(() => {
    setSaved(false);
  }, [settings]);

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm("Reset all settings to defaults?")) {
      setSettings(DEFAULTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const sections = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "account", label: "Account", icon: User },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "data", label: "Data", icon: Database },
  ];

  return (
    <div className="flex flex-col gap-6 w-full h-full min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: COLORS.text }}
          >
            <SettingsIcon
              className="w-6 h-6"
              style={{ color: COLORS.active }}
            />
            Settings
          </h2>
          <p className="text-sm" style={{ color: COLORS.sub }}>
            Manage your preferences and inventory settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span
              className="flex items-center gap-1 text-sm"
              style={{ color: COLORS.success }}
            >
              <Check className="w-4 h-4" /> Settings saved
            </span>
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl overflow-x-auto"
        style={{ background: COLORS.bg }}
      >
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
              style={{
                background: isActive ? COLORS.panel : "transparent",
                color: isActive ? COLORS.text : COLORS.sub,
                border: isActive ? `1px solid ${COLORS.panelBorder}` : "none",
              }}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* General Settings */}
      {activeSection === "general" && (
        <Panel>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4" style={{ color: COLORS.sub }} />
            <span
              className="text-xs font-semibold tracking-wider"
              style={{ color: COLORS.sub }}
            >
              APPEARANCE & PREFERENCES
            </span>
          </div>
          <Field label="Theme" hint="Dark or light mode">
            <Select
              value={settings.theme}
              onChange={(v) => update("theme", v)}
              options={[
                { value: "dark", label: "🌙 Dark" },
                { value: "light", label: "☀️ Light" },
                { value: "system", label: "💻 System" },
              ]}
            />
          </Field>
          <Field
            label="Currency"
            hint="Used to format prices across the dashboard"
          >
            <Select
              value={settings.currency}
              onChange={(v) => update("currency", v)}
              options={[
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
                { value: "SAR", label: "SAR (﷼)" },
              ]}
            />
          </Field>
          <Field label="Compact view" hint="Display more items per page">
            <Toggle
              checked={settings.compactView}
              onChange={(v) => update("compactView", v)}
            />
          </Field>
          <Field
            label="Auto-refresh"
            hint="Automatically update data every 30 seconds"
          >
            <Toggle
              checked={settings.autoRefresh}
              onChange={(v) => update("autoRefresh", v)}
            />
          </Field>
        </Panel>
      )}

      {/* Account Settings */}
      {activeSection === "account" && (
        <Panel>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4" style={{ color: COLORS.sub }} />
            <span
              className="text-xs font-semibold tracking-wider"
              style={{ color: COLORS.sub }}
            >
              ACCOUNT INFORMATION
            </span>
          </div>
          <div
            className="flex items-center gap-4 py-3 border-b"
            style={{ borderColor: COLORS.grid }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: `${COLORS.active}33`, color: COLORS.active }}
            >
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <p
                className="text-lg font-semibold"
                style={{ color: COLORS.text }}
              >
                {user?.name || "User"}
              </p>
              <p className="text-sm" style={{ color: COLORS.sub }}>
                {user?.email || "user@example.com"}
              </p>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1"
                style={{
                  background: "rgba(62,207,142,0.15)",
                  color: COLORS.success,
                }}
              >
                ● Active
              </span>
            </div>
          </div>
          <div className="pt-3">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
              style={{ background: COLORS.panelBorder, color: COLORS.text }}
            >
              Change Password
            </button>
          </div>
        </Panel>
      )}

      {/* Alert Settings */}
      {activeSection === "alerts" && (
        <Panel>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4" style={{ color: COLORS.sub }} />
            <span
              className="text-xs font-semibold tracking-wider"
              style={{ color: COLORS.sub }}
            >
              NOTIFICATION PREFERENCES
            </span>
          </div>
          <Field
            label="Email alerts"
            hint="Get notified when items are expiring soon or low on stock"
          >
            <Toggle
              checked={settings.emailAlerts}
              onChange={(v) => update("emailAlerts", v)}
            />
          </Field>
          <Field
            label="Low stock threshold"
            hint="Items at or below this quantity are flagged as low stock"
          >
            <NumberInput
              value={settings.lowStockThreshold}
              onChange={(v) => update("lowStockThreshold", v)}
              suffix="units"
            />
          </Field>
          <Field
            label="Expiry warning window"
            hint="Items expiring within this many days show as 'expiring soon'"
          >
            <NumberInput
              value={settings.expiryWarningDays}
              onChange={(v) => update("expiryWarningDays", v)}
              suffix="days"
            />
          </Field>
        </Panel>
      )}

      {/* Data Settings */}
      {activeSection === "data" && (
        <Panel>
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4" style={{ color: COLORS.sub }} />
            <span
              className="text-xs font-semibold tracking-wider"
              style={{ color: COLORS.sub }}
            >
              DATA MANAGEMENT
            </span>
          </div>
          <Field
            label="Export all inventory"
            hint={`${items.length} items as a formatted CSV file`}
          >
            <button
              onClick={() => exportItemsToCSV(items, "full-inventory")}
              disabled={items.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-40 hover:opacity-80"
              style={{ background: COLORS.active, color: "#fff" }}
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </Field>
          <Field
            label="Export settings"
            hint="Download your preferences as a JSON file"
          >
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(settings, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "settings-backup.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-80"
              style={{ background: COLORS.panelBorder, color: COLORS.text }}
            >
              <FileText className="w-3.5 h-3.5" /> Backup Settings
            </button>
          </Field>
        </Panel>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-80"
          style={{ background: COLORS.active, color: "#fff" }}
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-80"
          style={{ background: "rgba(194,62,143,0.15)", color: COLORS.danger }}
        >
          <RefreshCw className="w-4 h-4" /> Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
