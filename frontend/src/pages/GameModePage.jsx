import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { classifyThreat } from '../utils/anthropic';
import { Target, Zap, Clock, Trophy, Flame, AlertCircle, ArrowRight } from 'lucide-react';

// Preloaded data
const GAME_SAMPLES = [
  // Phishing
  { content: "Verify your Apple ID immediately to prevent account suspension: http://apple-verify-service.com/login", category: "Phishing" },
  { content: "From: hr@company-updates.com\nSubject: Q3 Bonus Documents\nPlease review the attached document for your Q3 bonus structure. Sign in with your work credentials to view.", category: "Phishing" },
  { content: "URGENT: Your parcel delivery failed. Fee required 1.99 USD. Pay here: http://post-delivery-track.net", category: "Phishing" },
  { content: "PayPal: We noticed unusual activity. Please click here to secure your account: http://paypal.security-check.net/auth", category: "Phishing" },
  { content: "Netflix: Your membership has been paused. Update payment at: http://netfIix-billing.com (note the capital I)", category: "Phishing" },
  
  // Malware
  { content: "YOUR PC IS INFECTED WITH 3 VIRUSES! Click here to scan and remove immediately.", category: "Malware" },
  { content: "From: admin@it-dept.com\nAttachment: urgent_software_update.exe\nPlease run this update to patch a critical zero-day vulnerability on your system.", category: "Malware" },
  { content: "Click here to install the missing video plugin to watch this content: http://video-codec-auto-installer.com", category: "Malware" },
  { content: "Download Photoshop 2024 Full Crack Pre-Activated No Virus -> http://free-cracks-now.to", category: "Malware" },
  { content: "Microsoft Windows Alert: Suspicious activity detected. Download our removal tool (removal_tool_v2.zip) immediately.", category: "Malware" },
  
  // Social Engineering
  { content: "Hi, it's John from IT. I'm trying to fix the server issue but I'm locked out. Can you text me your password quickly?", category: "Social Engineering" },
  { content: "Hey, it's [CEO Name]. I'm stuck in a meeting and need to buy Apple gift cards for clients right now. Can you purchase 5x $100 cards and scratch off the codes for me? I'll reimburse you.", category: "Social Engineering" },
  { content: "Hi! It's me, Sarah! I lost my phone and this is my new number. Can you send me $50 on Venmo? I forgot my wallet and need gas.", category: "Social Engineering" },
  { content: "Take this 2-minute survey about your workplace and earn a $500 Amazon Gift card guaranteed! Need your bank info to process the reward.", category: "Social Engineering" },
  { content: "Amazing job offer: Work from home 2 hrs a day for $5000/month. We just need a $100 setup fee to send you the laptop.", category: "Social Engineering" },
  
  // Safe
  { content: "Google: Your verification code is 829-102. Don't share this code with anyone.", category: "Safe" },
  { content: "GitHub: A new issue has been assigned to you. https://github.com/your-org/your-repo/issues/42", category: "Safe" },
  { content: "Your monthly bank statement is now available to view in your secure online banking portal or mobile app.", category: "Safe" },
  { content: "From: newsletter@medium.com\nHere are your daily tech reads for Tuesday. Read more in the app.", category: "Safe" },
  { content: "Amazon: Your package is out for delivery today. Track your real-time status in the Amazon App.", category: "Safe" },
];

const GameModePage = () => {
  const { addXp, streak, setStreak, unlockBadge } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streakInGame, setStreakInGame] = useState(0);
  const [questions, setQuestions] = useState([]);
  
  const [currentResult, setCurrentResult] = useState(null); // 'correct', 'wrong'
  const [explanation, setExplanation] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);
  
  const [startTime, setStartTime] = useState(null);
  
  const startSession = () => {
    // Shuffle and pick 10
    const shuffled = [...GAME_SAMPLES].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 10));
    setRound(1);
    setSessionScore(0);
    setCorrectCount(0);
    setStreakInGame(0);
    setIsPlaying(true);
    setCurrentResult(null);
    setStartTime(Date.now());
  };

  const handlePredict = async (prediction) => {
    if (currentResult || isClassifying) return; // Prevent double clicks
    
    // Check speed
    const timeTaken = (Date.now() - startTime) / 1000;
    const isFast = timeTaken < 5;
    
    const currentQ = questions[round - 1];
    setIsClassifying(true);
    
    try {
      // In a real app we might ask Claude for the explanation on the fly, 
      // but to ensure the game is snappy, we'll evaluate locally first, 
      // and maybe generate a quick explanation. We can mock it here for speed.
      const isCorrect = currentQ.category === prediction;
      
      let xpGained = 0;
      let roundExplanation = "";
      
      if (isCorrect) {
        setCurrentResult('correct');
        xpGained += 50; // base
        if (isFast) xpGained += 10; // speed bonus
        
        const newStreak = streakInGame + 1;
        setStreakInGame(newStreak);
        
        if (newStreak === 3) xpGained += 30;
        if (newStreak === 5) {
          xpGained += 75;
          unlockBadge('unstoppable', 'Unstoppable! (5 in a row)');
        }
        
        setSessionScore(prev => prev + xpGained);
        setCorrectCount(prev => prev + 1);
        addXp(xpGained, `Correct! ${isFast ? '+ Speed Bonus' : ''}`);
        
        // Update global streak if game streak is high
        if (newStreak > streak) setStreak(newStreak);
        if (newStreak === 7) unlockBadge('guardian', 'Guardian (7 Streak)');
        
        // Track specific categories for badges
        // This is simplified. In a real app we'd track these permanently in Context
        if (currentQ.category === 'Phishing') unlockBadge('phishing_spotter', 'Phishing Spotter');
      } else {
        setCurrentResult('wrong');
        setStreakInGame(0);
        
        // Call AI for explanation of why we're wrong
        const classification = await classifyThreat(currentQ.content, 'text');
        roundExplanation = classification.explanation;
        setExplanation(roundExplanation || `That was actually ${currentQ.category}. Look closer at the language and URLs!`);
      }
      
    } catch (e) {
      console.error(e);
    } finally {
      setIsClassifying(false);
    }
  };

  const nextRound = () => {
    if (round >= 10) {
      // End game
      setRound(11);
      if (correctCount === 10) unlockBadge('perfect_round', 'Perfect Round! 10/10');
      unlockBadge('cyber_rookie', 'Cyber Rookie (First Scan/Game completed)');
    } else {
      setRound(prev => prev + 1);
      setCurrentResult(null);
      setStartTime(Date.now());
    }
  };

  if (!isPlaying) {
    return (
      <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-center space-y-8 animate-slideUpFade">
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(99,102,241,0.3)]">
            <Gamepad2 size={48} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Threat Hunter Training</h1>
          <p className="text-xl text-secondary-color max-w-2xl">
            Test your instincts in a rapid-fire prediction game. Identify 10 real-world threats correctly to earn XP and level up.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-8">
          <div className="surface-card p-4 text-center">
            <Target className="mx-auto mb-2 text-green-500" />
            <div className="font-bold text-lg">+50 XP</div>
            <div className="text-xs text-secondary-color">Correct Answer</div>
          </div>
          <div className="surface-card p-4 text-center">
            <Clock className="mx-auto mb-2 text-yellow-500" />
            <div className="font-bold text-lg">+10 XP</div>
            <div className="text-xs text-secondary-color">Under 5 seconds</div>
          </div>
          <div className="surface-card p-4 text-center">
            <Flame className="mx-auto mb-2 text-orange-500" />
            <div className="font-bold text-lg">+75 XP</div>
            <div className="text-xs text-secondary-color">5-Streak Bonus</div>
          </div>
          <div className="surface-card p-4 text-center">
            <Trophy className="mx-auto mb-2 text-purple-500" />
            <div className="font-bold text-lg">Badges</div>
            <div className="text-xs text-secondary-color">Unlock achievements</div>
          </div>
        </div>

        <button onClick={startSession} className="btn btn-primary px-12 py-4 text-xl mt-12 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/30">
          Start Round
        </button>
      </div>
    );
  }

  // End Screen
  if (round > 10) {
    return (
      <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center space-y-8 animate-slideUpFade">
        <div className="surface-card p-12 text-center w-full">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Session Complete!</h2>
          <p className="text-secondary-color mb-8">Here is how you performed.</p>
          
          <div className="flex justify-center items-center gap-12 mb-8">
            <div>
              <div className="text-5xl font-bold text-green-400">{correctCount}/10</div>
              <div className="text-sm text-secondary-color mt-2 uppercase tracking-wide">Accuracy</div>
            </div>
            <div className="w-px h-16 bg-[var(--border-color)]"></div>
            <div>
              <div className="text-5xl font-bold text-[var(--color-primary)]">+{sessionScore}</div>
              <div className="text-sm text-secondary-color mt-2 uppercase tracking-wide">XP Earned</div>
            </div>
          </div>

          <button onClick={startSession} className="btn btn-primary w-full py-4 text-lg">
            Play Again
          </button>
          <button onClick={() => setIsPlaying(false)} className="btn btn-secondary w-full py-4 text-lg mt-4">
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[round - 1];

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold">Round {round}/10</div>
          <div className="flex bg-[var(--border-color)] h-3 rounded-full w-48 overflow-hidden">
            <div className="bg-[var(--color-primary)] h-full transition-all duration-300" style={{ width: `${(round/10)*100}%` }}></div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
            <Zap className="fill-[var(--color-primary)]" /> {sessionScore} XP
          </div>
          {streakInGame > 1 && (
            <div className="flex items-center gap-1 text-orange-500 font-bold animate-pulse">
              <Flame className="fill-orange-500" /> {streakInGame}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className={`surface-card p-8 mb-8 text-center transition-all duration-300 transform ${currentResult === 'correct' ? 'border-green-500 shadow-[0_0_30px_rgba(46,213,115,0.2)] scale-105' : currentResult === 'wrong' ? 'border-red-500 shadow-[0_0_30px_rgba(255,71,87,0.2)]' : ''}`}>
        <div className="bg-white/5 border border-[var(--border-color)] rounded-xl p-6 text-left relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-primary)]"></div>
          <p className="text-lg whitespace-pre-wrap leading-relaxed">{currentQ.content}</p>
        </div>
      </div>

      {/* Answer Board */}
      {!currentResult && !isClassifying && (
        <div className="grid grid-cols-2 gap-4 animate-slideUpFade">
          {['Phishing', 'Malware', 'Social Engineering', 'Safe'].map(cat => (
            <button 
              key={cat}
              onClick={() => handlePredict(cat)}
              className="btn btn-secondary py-6 text-xl hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isClassifying && (
        <div className="text-center py-12 animate-pulse">
          <div className="inline-block p-4 rounded-full bg-[var(--surface-color)] shadow-xl mb-4 text-[var(--color-primary)]">
            <Zap size={32} />
          </div>
          <h3 className="text-xl font-bold">AI is verifying your answer...</h3>
        </div>
      )}

      {/* Result View */}
      {currentResult && (
        <div className="animate-slideUpFade">
          {currentResult === 'correct' ? (
            <div className="p-6 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">Correct!</h2>
              <p>Great instincts. You identified the {currentQ.category} correctly.</p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-500 text-left mb-6">
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <AlertCircle /> Incorrect
              </h2>
              <p className="font-bold mb-2">This was actually {currentQ.category}.</p>
              <p className="text-red-400">{explanation}</p>
            </div>
          )}

          <button onClick={nextRound} className="btn btn-primary w-full py-6 text-xl flex justify-center items-center gap-2">
            Continue <ArrowRight />
          </button>
        </div>
      )}
    </div>
  );
};

// Lucide icon replacement since I missed Gamepad2 in the import
import { Gamepad2 } from 'lucide-react';

export default GameModePage;
