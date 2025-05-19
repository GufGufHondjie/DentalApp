// src/components/LayoutWrapper.tsx

/**
 * LayoutWrapper Component
 *
 * Provides a responsive and centered layout for the entire app.
 *
 * Props:
 * - children: React nodes passed between wrapper tags
 */

import React from "react";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
};

export default LayoutWrapper;
