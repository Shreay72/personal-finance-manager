import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/transactions', label: 'Transactions', icon: TransactionsIcon },
    { path: '/budgets', label: 'Budgets', icon: BudgetsIcon },
    { path: '/goals', label: 'Goals', icon: GoalsIcon },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-slate-950/90 border-r border-slate-800/80 px-5 py-6 gap-6">
      {/* Header */}
      <header className="flex items-center gap-3 px-1">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-emerald-400 shadow-lg shadow-indigo-900/60">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-50" fill="currentColor">
            <path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v1.2a2.8 2.8 0 0 1-2.8 2.8H7.8A3.8 3.8 0 0 1 4 7.2V7Zm3.2 7.5a1 1 0 0 0-1.2.97V17a3 3 0 0 0 3 3h7.5a1 1 0 0 0 .96-.72l1.46-4.87A1 1 0 0 0 18 13H9.14a4 4 0 0 0-1.94.52l-.99.58Z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wide text-slate-100">Finance Manager</span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Personal Dashboard</span>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-3 px-1">Main</p>
        <ul className="space-y-1.5 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`pill-tab flex w-full items-center gap-3 px-3.5 py-2.5 text-left focus-ring ${
                    isActive
                      ? 'nav-link-active text-slate-100'
                      : 'text-slate-300 hover:text-slate-50 hover:bg-slate-800/80'
                  }`}
                >
                  <span className={`flex items-center justify-center w-8 h-8 rounded-2xl ${
                    isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-sky-300'
                  }`}>
                    <Icon />
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <footer className="mt-4 border-t border-slate-800/80 pt-4">
        <div className="flex items-center gap-3 px-1 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-sky-400 to-emerald-400 flex items-center justify-center text-sm font-semibold text-slate-950 shadow-md shadow-sky-500/40">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 flex flex-col">
            <span className="text-sm font-medium text-slate-100 truncate">{user?.name || 'User'}</span>
            <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-xs text-left px-3 py-2 rounded-lg bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-slate-100 focus-ring"
        >
          Logout
        </button>
      </footer>
    </aside>
  );
};

// Icon Components
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M4 4h7v7H4V4Zm9 0h7v5h-7V4ZM4 13h7v7H4v-7Zm9 3h7v4h-7v-4Z" />
  </svg>
);

const TransactionsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M5 5h14v3H5zM3 10h18v3H3zm2 5h14v3H5z" />
  </svg>
);

const BudgetsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M4 5h16v3H4zm0 5h10v9H4zM16 10h4v9h-4z" />
  </svg>
);

const GoalsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2 3 6.5V8h1v9l8 4 8-4V8h1V6.5L12 2Zm0 2.18L18.26 7 12 9.82 5.74 7ZM6 9.47l6 2.7 6-2.7V16l-6 3-6-3V9.47Z" />
  </svg>
);

export default Navbar;
