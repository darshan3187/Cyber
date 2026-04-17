import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Star, Moon, Sun, Award, Shield, Target, Activity, Trophy, Zap, BrainCircuit, Lock } from 'lucide-react';

const Header = () => {
  const { xp, streak, theme, toggleTheme, badges } = useApp();
  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowBadgePopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <h2 className="text-xl font-bold hidden md:block text-[var(--text-primary)]">Welcome back!</h2>
        <div className="hidden md:flex items-center gap-4 mt-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold shadow-sm cursor-help hover:bg-indigo-500/20 transition-colors">
            <Shield size={18} />
            {levelInfo.name}
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 font-bold shadow-sm cursor-help hover:bg-purple-500/20 transition-colors relative overflow-hidden">
            <Star size={18} className="fill-purple-500/20" />
            <span>{xp} <span className="opacity-60 text-xs">/ {levelInfo.max} XP</span></span>
            <div 
              className="absolute bottom-0 left-0 h-1 bg-purple-500 opacity-50" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
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
        <div className="relative" ref={popupRef}>
          <button 
            onClick={() => setShowBadgePopup(!showBadgePopup)}
            className="flex items-center gap-2 hover:bg-[var(--border-color)] p-1 rounded-xl transition-colors text-left"
          >
            <div className={`p-2 rounded-xl transition-colors ${badges.length > 0 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-[var(--border-color)] text-secondary-color'}`}>
              <Award size={20} />
            </div>
            <div className="hidden sm:block pr-2">
              <div className="text-sm font-bold">{badges.length}</div>
              <div className="text-xs text-secondary-color">Badges</div>
            </div>
          </button>
          
          {showBadgePopup && (
            <div className="absolute top-full right-0 mt-2 w-64 surface-card border border-soft shadow-2xl z-50 p-4 animate-slideUpFade">
              <h4 className="font-bold border-b border-soft pb-2 mb-3">Your Badges</h4>
              {badges.length === 0 ? (
                <div className="text-sm text-secondary-color text-center py-4">No badges unlocked yet!</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {badges.map(id => {
                    const dict = {
                      'rookie': { name: 'Cyber Rookie', icon: <Shield size={16} /> },
                      'spotter': { name: 'Threat Spotter', icon: <Target size={16} /> },
                      'analyst': { name: 'Security Analyst', icon: <Activity size={16} /> },
                      'hunter': { name: 'Threat Hunter', icon: <Flame size={16} /> },
                      'guardian': { name: 'Cyber Guardian', icon: <Shield size={16} /> },
                      'unstoppable': { name: 'Unstoppable!', icon: <Zap size={16} /> },
                      'perfect_round': { name: 'Perfect Round', icon: <Trophy size={16} /> },
                      'phishing_spotter': { name: 'Phishing Spotter', icon: <BrainCircuit size={16} /> }
                    };
                    const b = dict[id] || { name: id, icon: <Award size={16} /> };
                    return (
                      <div key={id} className="flex items-center gap-3 p-2 bg-[var(--bg-color)] rounded-lg">
                        <div className="text-yellow-500 bg-yellow-500/10 p-1.5 rounded-md">{b.icon}</div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">{b.name}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
