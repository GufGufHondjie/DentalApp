// src/components/Tooltip.tsx

import React from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

/**
 * Tooltip Component
 *
 * Wraps any child element and shows a tooltip on hover.
 * Uses Tailwind utility classes for smooth opacity transitions.
 *
 * Props:
 * - content: Tooltip text
 * - children: React element(s) to wrap
 */
const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <div className="relative group inline-block cursor-pointer">
      {children}
      <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
        {content}
      </div>
    </div>
  );
};

export default Tooltip;
