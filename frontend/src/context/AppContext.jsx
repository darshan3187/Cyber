import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('cyberguard_theme') || 'dark');
  const [xp, setXp] = useState(parseInt(localStorage.getItem('cyberguard_xp')) || 0);
  const [streak, setStreak] = useState(parseInt(localStorage.getItem('cyberguard_streak')) || 0);
  const [badges, setBadges] = useState(JSON.parse(localStorage.getItem('cyberguard_badges')) || []);
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('cyberguard_history')) || []);
  const [quizHistory, setQuizHistory] = useState(JSON.parse(localStorage.getItem('cyberguard_quiz_history')) || []);
  const [posts, setPosts] = useState(JSON.parse(localStorage.getItem('cyberguard_posts')) || getInitialPosts());
  const [showToast, setShowToast] = useState(null); // { title: '', icon: '', type: 'badge' | 'xp' }

  // Game/Quiz State
  const [isQuizActive, setIsQuizActive] = useState(false);

  // Threat Analyzer State
  const [analyzerInput, setAnalyzerInput] = useState('');
  const [analyzerResult, setAnalyzerResult] = useState(null);
  const [analyzerSimulationActive, setAnalyzerSimulationActive] = useState(null);
  const [analyzerPrediction, setAnalyzerPrediction] = useState(null);
  const [analyzerActiveTab, setAnalyzerActiveTab] = useState('General');

  useEffect(() => {
    const checkStreak = () => {
      const lastLoginStr = localStorage.getItem('cyberguard_last_login');
      const today = new Date().toDateString();
      
      if (lastLoginStr !== today) {
        let newStreak = parseInt(localStorage.getItem('cyberguard_streak')) || 0;
        if (lastLoginStr) {
          const lastLogin = new Date(lastLoginStr);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastLogin.toDateString() === yesterday.toDateString()) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
        
        setStreak(newStreak);
        localStorage.setItem('cyberguard_streak', newStreak.toString());
        localStorage.setItem('cyberguard_last_login', today);
      }
    };
    
    checkStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('cyberguard_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const addXp = (amount, reason = '') => {
    setXp(prev => {
      const newXp = prev + amount;
      localStorage.setItem('cyberguard_xp', newXp);
      return newXp;
    });
    
    setShowToast({ title: `+${amount} XP`, message: reason, type: 'xp' });
    setTimeout(() => setShowToast(null), 3000);
    
    checkLevelUp(xp, xp + amount);
  };

  const addHistory = (entry) => {
    const newEntry = { ...entry, id: Date.now(), timestamp: new Date().toISOString() };
    setHistory(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem('cyberguard_history', JSON.stringify(updated));
      return updated;
    });
    return newEntry;
  };

  const addQuizHistory = (entry) => {
    const newEntry = { ...entry, id: Date.now(), timestamp: new Date().toISOString() };
    setQuizHistory(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem('cyberguard_quiz_history', JSON.stringify(updated));
      return updated;
    });
    return newEntry;
  };

  const checkLevelUp = (oldXp, newXp) => {
    // Unlock badges based on XP milestones
    if (oldXp < 100 && newXp >= 100) unlockBadge('rookie', 'Cyber Rookie');
    if (oldXp < 300 && newXp >= 300) unlockBadge('spotter', 'Threat Spotter');
    if (oldXp < 600 && newXp >= 600) unlockBadge('analyst', 'Security Analyst');
    if (oldXp < 1000 && newXp >= 1000) unlockBadge('hunter', 'Threat Hunter');
    if (oldXp < 2000 && newXp >= 2000) unlockBadge('guardian', 'Cyber Guardian');
  };

  const unlockBadge = (badgeId, badgeName) => {
    if (!badges.includes(badgeId)) {
      const newBadges = [...badges, badgeId];
      setBadges(newBadges);
      localStorage.setItem('cyberguard_badges', JSON.stringify(newBadges));
      
      setShowToast({ title: 'New Badge Unlocked!', message: badgeName, type: 'badge' });
      setTimeout(() => setShowToast(null), 4000);
    }
  };

  const addPost = (post) => {
    setPosts(prev => {
      const updated = [post, ...prev];
      localStorage.setItem('cyberguard_posts', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      xp, addXp,
      streak, setStreak,
      badges, unlockBadge,
      history, addHistory,
      quizHistory, addQuizHistory,
      isQuizActive, setIsQuizActive,
      posts, addPost,
      showToast, setShowToast,
      analyzerInput, setAnalyzerInput,
      analyzerResult, setAnalyzerResult,
      analyzerSimulationActive, setAnalyzerSimulationActive,
      analyzerPrediction, setAnalyzerPrediction,
      analyzerActiveTab, setAnalyzerActiveTab
    }}>
      {children}
    </AppContext.Provider>
  );
};

function getInitialPosts() {
  return [
    {
      id: 1,
      author: 'Alex J.',
      initials: 'AJ',
      text: "Got this email from 'Paypa1.com' asking to verify my account. Noticed the 1 instead of l. Classic phishing!",
      tag: 'Phishing',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      likes: 12,
      comments: 2,
      verified: true
    },
    {
      id: 2,
      author: 'Sarah M.',
      initials: 'SM',
      text: "Someone pretending to be our CEO emailed asking for gift cards urgently. Always verify out-of-band!",
      tag: 'Social Engineering',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      likes: 45,
      comments: 8,
      verified: true
    },
    {
      id: 3,
      author: 'Cyber Ninja',
      initials: 'CN',
      text: "Fake antivirus popup that locked my browser. Had to force quit. Never click those scan now buttons.",
      tag: 'Malware',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      likes: 89,
      comments: 14,
      verified: true
    },
    {
      id: 4,
      author: 'InfoSec Dave',
      initials: 'ID',
      text: "Reminder: check the sender domain not just the display name. 'PayPal Support' can come from anything@scam.ru",
      tag: 'Awareness Tip',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      likes: 156,
      comments: 23,
      verified: false
    },
    {
      id: 5,
      author: 'Emma W.',
      initials: 'EW',
      text: "Received this SMS about a package. URL goes to a lookalike site. Always track directly on the courier website.",
      tag: 'Phishing',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      likes: 34,
      comments: 5,
      verified: true
    },
    {
      id: 6,
      author: 'Tech Support',
      initials: 'TS',
      text: "If anyone asks you for your OTP over the phone, it's 100% a scam. Banks never ask for OTP.",
      tag: 'Awareness Tip',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      likes: 412,
      comments: 56,
      verified: true
    },
    {
      id: 7,
      author: 'Mike R.',
      initials: 'MR',
      text: "Fake job offer on LinkedIn — asked for my bank details before any interview. Report and block.",
      tag: 'Social Engineering',
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      likes: 67,
      comments: 12,
      verified: true
    },
    {
      id: 8,
      author: 'Security Alert',
      initials: 'SA',
      text: "New malware campaign using fake Chrome update pages. Only update from browser settings, never a website.",
      tag: 'Malware',
      timestamp: new Date(Date.now() - 432000000).toISOString(),
      likes: 890,
      comments: 112,
      verified: true
    }
  ];
}
