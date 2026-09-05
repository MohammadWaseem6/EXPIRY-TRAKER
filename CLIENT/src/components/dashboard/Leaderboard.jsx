import { CheckCircle, XCircle } from "lucide-react";

const Leaderboard = ({ data }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[300px] sm:min-w-[400px] text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              #
            </th>
            <th className="text-left py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Item
            </th>
            <th className="text-left py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Qty
            </th>
            <th className="text-left py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Days Left
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            // Determine the status color based on days left
            const statusColor =
              row.daysLeft < 0
                ? "text-[#c23e8f]"
                : row.daysLeft <= 3
                  ? "text-[#f0a63a]"
                  : "text-[#3ecf8e]";

            return (
              <tr 
                key={idx} 
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-2 sm:py-3 px-2 sm:px-3 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  {idx + 1}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-3 font-medium text-gray-800 dark:text-gray-200 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[150px]">
                  {row.name}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-3 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  {row.qty}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-3">
                  <span
                    className={`text-[10px] sm:text-xs font-medium flex items-center gap-1 ${statusColor}`}
                  >
                    {row.daysLeft < 0 ? (
                      <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    )}
                    <span className="whitespace-nowrap">
                      {row.daysLeft < 0
                        ? `${Math.abs(row.daysLeft)}d overdue`
                        : `${row.daysLeft}d`}
                    </span>
                  </span>
                </td>
              </tr>
            );
          })}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400"
              >
                No items yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;