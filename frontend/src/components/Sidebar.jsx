import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Gamepad2, Users, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sidebar = ({ className = '' }) => {
  const { xp } = useApp();
  
  const navItems = [
    { name: 'Analyse', path: '/analyse', icon: Shield },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Game Mode', path: '/game', icon: Gamepad2 },
    { name: 'Community', path: '/community', icon: Users },
  ];

  return (
    <aside className={`bg-surface-color border-r border-soft flex flex-col ${className}`}>
      <div className="p-6 flex items-center gap-3">
        <div className="bg-[var(--color-primary)] p-2 rounded-xl text-white">
          <Target size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">CyberGuard</h1>
      </div>

      <div className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-secondary-color hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 m-4 surface-card flex flex-col gap-2 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex justify-between items-center relative z-10">
          <span className="text-sm font-semibold text-secondary-color">Total XP</span>
          <span className="text-[var(--color-primary)] font-bold">{xp}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
