import { Plus, Download } from "lucide-react";

const COLORS = {
  text: "#e8eef7",
  sub: "#7f97b8",
  panelBorder: "#1c3a5e",
};

const DashboardHeader = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>{title}</h1>
        <p className="text-sm" style={{ color: COLORS.sub }}>{subtitle}</p>
      </div>
      <div className="flex gap-3 mt-3 md:mt-0">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
          <Plus className="w-4 h-4" /> Add Product
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm"
          style={{ background: COLORS.panelBorder, color: COLORS.text }}
        >
          <Download className="w-4 h-4" /> Report
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;