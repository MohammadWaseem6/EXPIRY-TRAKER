import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Settings as SettingsIcon,
  Bell,
  AlertTriangle,
  Download,
  User,
  Check,
} from "lucide-react";
import { COLORS } from "../theme";
import { exportItemsToCSV } from "../utils/exportCSV";

const STORAGE_KEY = "storeops_settings";

const DEFAULTS = {
  lowStockThreshold: 5,
  expiryWarningDays: 3,
  emailAlerts: true,
  currency: "USD",
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
    style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
  >
    {children}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid ${COLORS.grid}` }}>
    <div>
      <p className="text-sm font-medium" style={{ color: COLORS.text }}>{label}</p>
      {hint && <p className="text-xs mt-0.5" style={{ color: COLORS.sub }}>{hint}</p>}
    </div>
    {children}
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className="w-11 h-6 rounded-full relative transition"
    style={{ background: checked ? "#4a9fdb" : COLORS.grid }}
  >
    <span
      className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
      style={{ left: checked ? "22px" : "2px" }}
    />
  </button>
);

const NumberInput = ({ value, onChange, min = 0, suffix }) => (
  <div className="flex items-center gap-2">
    <input
      type="number"
      min={min}
      value={value}
      onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
      className="w-20 px-3 py-1.5 rounded-lg text-sm text-right outline-none"
      style={{ background: COLORS.bg, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.text }}
    />
    {suffix && <span className="text-xs" style={{ color: COLORS.sub }}>{suffix}</span>}
  </div>
);

const SettingsView = ({ items = [] }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
  }, [settings]);

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: COLORS.text }}>
        <SettingsIcon className="w-5 h-5" /> Settings
      </h2>

      {/* Account */}
      <Panel>
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4" style={{ color: COLORS.sub }} />
          <span className="text-xs font-semibold tracking-wider" style={{ color: COLORS.sub }}>
            ACCOUNT
          </span>
        </div>
        <Field label={user?.name || "Signed-in user"} hint={user?.email || "No email on file"}>
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ background: "rgba(62,207,142,0.15)", color: "#3ecf8e" }}
          >
            Active
          </span>
        </Field>
      </Panel>

      {/* Thresholds */}
      <Panel>
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4" style={{ color: COLORS.sub }} />
          <span className="text-xs font-semibold tracking-wider" style={{ color: COLORS.sub }}>
            ALERT THRESHOLDS
          </span>
        </div>
        <Field label="Low stock threshold" hint="Items at or below this quantity are flagged as low stock">
          <NumberInput
            value={settings.lowStockThreshold}
            onChange={(v) => update("lowStockThreshold", v)}
            suffix="units"
          />
        </Field>
        <Field label="Expiry warning window" hint="Items expiring within this many days show as 'expiring soon'">
          <NumberInput
            value={settings.expiryWarningDays}
            onChange={(v) => update("expiryWarningDays", v)}
            suffix="days"
          />
        </Field>
      </Panel>

      {/* Notifications */}
      <Panel>
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4" style={{ color: COLORS.sub }} />
          <span className="text-xs font-semibold tracking-wider" style={{ color: COLORS.sub }}>
            NOTIFICATIONS
          </span>
        </div>
        <Field label="Email alerts" hint="Get notified when items are expiring soon or low on stock">
          <Toggle checked={settings.emailAlerts} onChange={(v) => update("emailAlerts", v)} />
        </Field>
        <Field label="Currency" hint="Used to format prices across the dashboard">
          <select
            value={settings.currency}
            onChange={(e) => update("currency", e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{ background: COLORS.bg, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.text }}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="SAR">SAR (﷼)</option>
          </select>
        </Field>
      </Panel>

      {/* Data */}
      <Panel>
        <div className="flex items-center gap-2 mb-1">
          <Download className="w-4 h-4" style={{ color: COLORS.sub }} />
          <span className="text-xs font-semibold tracking-wider" style={{ color: COLORS.sub }}>
            DATA
          </span>
        </div>
        <Field label="Export all inventory" hint={`${items.length} items as a formatted CSV file`}>
          <button
            onClick={() => exportItemsToCSV(items, "full-inventory")}
            disabled={items.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-40"
            style={{ background: "#4a9fdb", color: "#fff" }}
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </Field>
      </Panel>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition"
          style={{ background: "#4a9fdb", color: "#fff" }}
        >
          Save changes
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs" style={{ color: "#3ecf8e" }}>
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
