import { Plus, Download } from "lucide-react";

const DashboardHeader = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-custom-text">{title}</h1>
        <p className="text-sm text-custom-sub">{subtitle}</p>
      </div>
      <div className="flex gap-3 mt-3 md:mt-0">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
          <Plus className="w-4 h-4" /> Add Product
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm bg-custom-border text-custom-text hover:bg-custom-border/80">
          <Download className="w-4 h-4" /> Report
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
