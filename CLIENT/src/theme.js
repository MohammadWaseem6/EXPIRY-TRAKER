export const COLORS = {
  bg: "#0a1a2f",
  panel: "#0f2540",
  panelBorder: "#1c3a5e",
  text: "#e8eef7",
  sub: "#7f97b8",
  active: "#4a9fdb",
  success: "#3ecf8e",
  warning: "#f0a63a",
  danger: "#c23e8f",
  grid: "#1c3a5e",
};

export const daysUntil = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));