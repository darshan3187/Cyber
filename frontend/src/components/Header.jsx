import React from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Star, Moon, Sun, Award } from 'lucide-react';

const Header = () => {
  const { xp, streak, theme, toggleTheme, badges } = useApp();

  const getLevel = (xp) => {
    if (xp >= 1000) return { name: 'Cyber Guardian', max: xp };
    if (xp >= 601) return { name: 'Threat Hunter', max: 1000 };
    if (xp >= 301) return { name: 'Security Analyst', max: 600 };
    if (xp >= 101) return { name: 'Threat Spotter', max: 300 };
    return { name: 'Cyber Rookie', max: 100 };
  };

  const levelInfo = getLevel(xp);
  const progress = levelInfo.max === xp ? 100 : Math.min(100, (xp / levelInfo.max) * 100);

  return (
    <header className="h-20 border-b border-soft bg-surface-color flex items-center justify-between px-6 lg:px-8">
      <div className="flex-1">
        <h2 className="text-xl font-bold hidden md:block">Welcome back!</h2>
        <div className="hidden md:flex items-center gap-2 mt-1">
          <span className="text-sm font-medium text-[var(--color-primary)]">{levelInfo.name}</span>
          <div className="w-32 h-2 bg-[var(--bg-color)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--color-primary)] transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-secondary-color">{xp} / {levelInfo.max}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* Streak */}
        <div className="flex items-center gap-2 group cursor-help">
          <div className={`p-2 rounded-xl transition-colors ${streak > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-[var(--border-color)] text-secondary-color'}`}>
            <Flame size={20} className={streak > 0 ? 'animate-pulse' : ''} />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold">{streak} Day{streak !== 1 ? 's' : ''}</div>
            <div className="text-xs text-secondary-color">Streak</div>
          </div>
        </div>

        {/* Badges Count */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500">
            <Award size={20} />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold">{badges.length}</div>
            <div className="text-xs text-secondary-color">Badges</div>
          </div>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full hover:bg-[var(--border-color)] transition-colors text-secondary-color"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
