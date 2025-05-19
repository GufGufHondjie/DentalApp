// src/components/ErrorBoundary.tsx

/**
 * ErrorBoundary Component
 *
 * A reusable class-based error boundary to catch and display errors in the React component tree.
 * Useful for isolating failures in subcomponents and preserving app stability.
 *
 * Props:
 * - children: React nodes to wrap with error handling.
 *
 * State:
 * - hasError: tracks whether an error has occurred
 * - error: stores the error object
 */

import React from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Updates state when an error is thrown in a child component
   */
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  /**
   * Optional: Add logging service here if needed
   * componentDidCatch(error: any, errorInfo: any) {
   *   logErrorToService(error, errorInfo);
   * }
   */

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <strong>Component crashed:</strong>
          <pre className="text-xs mt-2 whitespace-pre-wrap">
            {String(this.state.error)}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
