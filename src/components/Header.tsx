import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import appIcon from "../assets/icon.png";

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Clear all application data
      // Local Storage
      localStorage.clear();
      
      // Session Storage
      sessionStorage.clear();
      
      // IndexedDB - Clear MACI keys database
      const request = indexedDB.deleteDatabase('amaci-keys');
      request.onsuccess = () => {
        console.log('IndexedDB database deleted successfully');
      };
      
      // Clear cookies
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });

      // Firebase logout
      await logout();

      console.log('All application data cleared successfully');
    } catch (error) {
      console.error("Failed to clear data and log out:", error);
    }
  };

  return (
    <header className="bg-bg-secondary shadow-lg">
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src={appIcon}
              alt="ZK-AMACI"
              className="h-8 w-8 rounded-full border-2 border-accent"
            />
            <h1 className="text-xl font-bold text-accent tracking-wide">
              ZK-AMACI
            </h1>
          </div>

          {currentUser && (
            <div className="flex items-center relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden p-2 rounded-full bg-bg-primary text-accent hover:bg-accent hover:text-bg-primary transition-colors duration-300 hover-glow"
              >
                {isMenuOpen ? (
                  <FiX className="w-5 h-5" />
                ) : (
                  <FiMenu className="w-5 h-5" />
                )}
              </button>
              <div
                className={`absolute right-0 top-[calc(100%+0.5rem)] w-48 sm:w-auto sm:relative sm:flex sm:items-center sm:space-x-4 bg-bg-primary p-4 sm:p-0 rounded-lg sm:rounded-none shadow-lg sm:shadow-none transition-all duration-300 z-50 ${
                  isMenuOpen ? "block" : "hidden sm:flex"
                }`}
              >
                <div className="text-sm text-text-primary truncate max-w-[150px] bg-bg-secondary px-3 py-2 rounded-full mb-2 sm:mb-0">
                  {currentUser.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full sm:w-auto px-3 py-2 rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                  title="Logout"
                >
                  <FiLogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="ml-2">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
