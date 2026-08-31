// Formats item rows into a well-structured CSV and triggers a browser download.

const escapeCell = (value) => {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const fmtCurrency = (value) => {
  const n = parseFloat(value) || 0;
  return n.toFixed(2);
};

const daysUntil = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

const statusOf = (days) => {
  if (days < 0) return "Expired";
  if (days <= 3) return "Expiring Soon";
  return "Fresh";
};

export const exportItemsToCSV = (items, filename = "items-export") => {
  const headers = ["Name", "Category", "Quantity", "Price ($)", "Expiry Date", "Days Left", "Status"];

  const rows = items.map((item) => {
    const days = daysUntil(item.expiryDate);
    return [
      escapeCell(item.name || "Unnamed item"),
      escapeCell(item.category || "Uncategorized"),
      escapeCell(item.quantity ?? 0),
      escapeCell(fmtCurrency(item.price)),
      escapeCell(fmtDate(item.expiryDate)),
      escapeCell(days),
      escapeCell(statusOf(days)),
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  const stamp = new Date().toISOString().slice(0, 10);
  link.download = `${filename}-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};