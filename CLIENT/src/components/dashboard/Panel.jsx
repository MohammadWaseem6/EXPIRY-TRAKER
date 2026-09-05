const Panel = ({ children, className = "" }) => (
  <div
    className={`rounded-xl p-4 sm:p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
  >
    {children}
  </div>
);

export default Panel;