import {
  Search,
  Bell,
  User,
  MoreHorizontal,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { useState } from "react";

export function Header({ user, currentView, setCurrentView }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    // For now, just reload the page. In a real app, this would clear auth tokens
    if (confirm("Are you sure you want to logout?")) {
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 md:pl-20 h-16 border-b border-gray-200 bg-white">
      {/* Left cluster */}
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-semibold tracking-wide text-gray-700">
          TEAMFLOW
        </h1>
        <nav className="hidden md:flex gap-6 text-sm">
          <span
            className={`cursor-pointer ${currentView === "dashboard" ? "text-gray-700" : "text-gray-400 hover:text-gray-600"}`}
            onClick={() => setCurrentView("dashboard")}
          >
            Dashboard
          </span>
          <span
            className={`cursor-pointer ${currentView === "analytics" ? "text-gray-700" : "text-gray-400 hover:text-gray-600"}`}
            onClick={() => setCurrentView("analytics")}
          >
            Analytics
          </span>
          <span className="text-gray-400 hover:text-gray-600 cursor-pointer">
            Teams
          </span>
          <MoreHorizontal className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
        </nav>
      </div>

      {/* Center: Search bar */}
      <div className="flex-1 max-w-[300px] md:flex hidden">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-gray-200 focus:ring-0 focus:border-gray-300 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <Bell className="h-5 w-5 text-gray-400 cursor-pointer" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-blue-600"></span>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="hidden sm:block text-sm text-gray-700">
              {user?.username || "Loading..."}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  alert("Profile settings coming soon!");
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                Profile Settings
              </button>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  alert("Account preferences coming soon!");
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="h-4 w-4" />
                Account
              </button>

              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
}
