import React, {  } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FiLogOut, } from "react-icons/fi";
import appIcon from "../assets/icon.png";

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-bg-secondary/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-text-secondary/10">
      <div className="max-w-screen-xl mx-auto">
        <div className="px-4 h-14 flex items-center justify-between">
          {/* Logo Section - Left */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src={appIcon}
                alt="ZK-AMACI"
                className="h-8 w-8 rounded-lg border border-accent/50 shadow-md"
              />
              <h1 className="text-lg font-bold text-accent tracking-tight">
                ZK-AMACI
              </h1>
            </div>
          </div>

          {/* User Section - Right */}
          {currentUser && (
            <div className="flex items-center gap-2">
              {/* User Profile */}
              <div className="relative group">
                <button 
                  className="flex items-center justify-center h-9 w-9 rounded-full bg-accent/5 hover:bg-accent/10 transition-colors border border-accent/10"
                  title={currentUser.email || ''}
                >
                  <img 
                    src={currentUser.photoURL || 'default-avatar.png'} 
                    alt="Profile"
                    className="h-7 w-7 rounded-full object-cover"
                  />
                </button>
                {/* Tooltip */}
                <div className="absolute right-0 mt-2 w-max max-w-[200px] py-1.5 px-3 bg-bg-primary rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs border border-text-secondary/10">
                  <p className="truncate text-text-secondary">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="h-9 w-9 flex items-center justify-center rounded-lg text-danger/80 hover:text-danger hover:bg-danger/10 transition-all"
                title="Logout"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
