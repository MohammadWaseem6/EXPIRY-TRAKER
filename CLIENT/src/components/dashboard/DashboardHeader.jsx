import { Plus, Download } from "lucide-react";

const DashboardHeader = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
      <div className="w-full sm:w-auto">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;