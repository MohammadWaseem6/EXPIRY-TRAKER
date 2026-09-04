import { Plus, Download } from "lucide-react";

const DashboardHeader = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-custom-text">{title}</h1>
        <p className="text-sm text-custom-sub">{subtitle}</p>
      </div>
      
    </div>
  );
};

export default DashboardHeader;
