import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link as LinkIcon, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-[#0d0f1c]/90 backdrop-blur-md border-b border-white/[0.07] sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow duration-200">
                <LinkIcon size={16} className="stroke-[2.5] text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight gradient-text">LinkShort</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 bg-white/[0.05] border border-white/[0.08] rounded-full px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-semibold text-slate-300">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 border border-violet-500/30 px-3 py-1.5 rounded-full shadow-md shadow-violet-500/20 transition-all duration-200"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
