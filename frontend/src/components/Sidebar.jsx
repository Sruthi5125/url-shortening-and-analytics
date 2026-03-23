import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Link2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-[#0d0f1c] border-r border-white/[0.07] overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/[0.07]">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
            <Link2 size={18} className="text-white stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight gradient-text">LinkShort</span>
            <p className="text-[10px] text-slate-500 font-medium -mt-0.5">URL Analytics</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Menu</p>
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-white/[0.07] space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              {user.email && <p className="text-[11px] text-slate-500 truncate">{user.email}</p>}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
};