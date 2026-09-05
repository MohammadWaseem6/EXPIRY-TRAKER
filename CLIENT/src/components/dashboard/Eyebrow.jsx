const Eyebrow = ({ children, right }) => (
  <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
    <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
      {children}
    </span>
    {right && (
      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
        {right}
      </span>
    )}
  </div>
);

export default Eyebrow;