/**
 * Header Component
 *
 * Top bar that includes the logo and logout button.
 * Responsive design and custom branding with clinic logo.
 *
 * Props:
 * - user: { email: string } - currently logged-in user info
 * - onLogout: () => void - logout handler triggered by button
 */

import React from "react";
import logo from "../assets/KDvE Logo NGI 500x100.png";

interface HeaderProps {
  user: {
    email: string;
  };
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
      {/* Left side: Logo */}
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="Klinika Dental van Egmond"
          className="h-10 w-auto"
        />
      </div>

      {/* Right side: User info and logout */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-700 hidden sm:block">{user.email}</span>
        <button
          onClick={onLogout}
          className="bg-gray-100 border px-3 py-1 rounded text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
