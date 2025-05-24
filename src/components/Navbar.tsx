import React from "react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout?: () => void;
  currentPath?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, onLogout, currentPath = "" }) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    // Redirect to auth page after logout
    window.location.href = "/auth";
  };

  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex-shrink-0">
          <span className="text-xl font-bold text-gray-900">10x-cards</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4">
          {/* Show Flashcards and Generations links only for authenticated users */}
          {isAuthenticated && (
            <>
              <a
                href="/flashcards"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/flashcards")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Flashcards
              </a>

              <a
                href="/generations"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/generations")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Generate
              </a>
            </>
          )}

          {/* Authentication Section */}
          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2">
              Wyloguj
            </Button>
          ) : (
            <a
              href="/auth"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/auth") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Zaloguj / Zarejestruj
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};
