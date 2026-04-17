import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { jsPDF } from 'jspdf';
import { Download, Shield, Target, Flame, Activity, BrainCircuit } from 'lucide-react';
import { classifyThreat } from '../utils/anthropic';

const COLORS = ['#FF4757', '#FF6B35', '#FFD700', '#2ED573']; // Red, Orange, Yellow, Green

const DashboardPage = () => {
  const { xp, streak, history, quizHistory } = useApp();
  const dashboardRef = useRef(null);
  const [aiTip, setAiTip] = useState("Analyzing your patterns...");
  const [historyTab, setHistoryTab] = useState('scans'); // 'scans' or 'quizzes'

  const totalScans = history.length;
  const threatsCaught = history.filter(h => h.category !== 'Safe').length;

  // Chart 1: XP over time (mocked for demo over 7 days if not enough history)
  // Let's generate a graph based on today, subtracting days.
  const getGraphData = () => {
    const data = [];
    const today = new Date();
    for(let i=6; i>=0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      // Count XP from history for this day, or mock a baseline if empty
      const historyThisDay = history.filter(h => new Date(h.timestamp).toDateString() === d.toDateString());
      const xpThisDay = historyThisDay.reduce((sum, h) => sum + (h.xpEarned || 0), 0);
      data.push({ name: dayStr, xp: xpThisDay + (history.length === 0 ? Math.floor(Math.random() * 50) : 0) });
    }
    return data;
  };

  // Chart 2: Weak spots (mistakes in game mode, or categories of threats found)
  const getWeakSpotsData = () => {
    const counts = { Phishing: 0, Malware: 0, 'Social Engineering': 0 };
    history.forEach(h => {
      if (h.category !== 'Safe' && counts[h.category] !== undefined) {
        counts[h.category]++;
      }
    });
    // Add mock data if empty so chart doesn't look bland
    if (totalScans === 0) {
      counts.Phishing = 3;
      counts.Malware = 1;
      counts['Social Engineering'] = 2;
    }
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  };

  const weakSpotsData = getWeakSpotsData();

  useEffect(() => {
    const fetchTip = async () => {
      // In a real app we'd call Claude: "Based on user mistakes... provide tips"
      // For the demo we simulate this based on the highest category in weak spots
      const highest = [...weakSpotsData].sort((a,b) => b.value - a.value)[0];
      
      const tips = {
        'Phishing': "Weakness: Phishing (Fake Emails/Links)\n\nPhishing tricks you into giving away credentials by pretending to be a trusted company.\n\nQuick Tips:\n• Always check the sender's real email address.\n• Hover over links before clicking to spot fake URLs.\n• When in doubt, manually type the website into your browser.",
        
        'Malware': "Weakness: Malware (Malicious Files)\n\nMalware actively infects your device through hidden files or dangerous downloads.\n\nQuick Tips:\n• Never download or open unexpected email attachments.\n• Watch out for dangerous file types like .exe, .bat, or .zip.\n• Disable automatic macros in Word or Excel.",
        
        'Social Engineering': "Weakness: Social Engineering (Psychological Tricks)\n\nAttackers use fear or urgency (like a fake boss asking for gift cards) to bypass defenses.\n\nQuick Tips:\n• Pause for 10 seconds before reacting to urgent demands.\n• Verify unusual requests by calling the person directly.\n• Never share passwords or internal company info over text."
      };
      
      setAiTip(tips[highest.name] || "Great job staying secure! Keep analyzing any suspicious emails before taking action.");
    };
    fetchTip();
  }, [history]);

  const handleExportPDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let cursorY = 20;

      // Helper function for page breaks
      const checkPageBreak = (spaceNeeded = 10) => {
        if (cursorY + spaceNeeded > 280) {
          pdf.addPage();
          cursorY = 20;
        }
      };

      // Header
      pdf.setFontSize(22);
      pdf.setTextColor(40, 40, 40);
      pdf.text("CyberGuard Analytics Report", pageWidth / 2, cursorY, { align: "center" });
      cursorY += 10;
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated exactly on: ${new Date().toLocaleString()}`, pageWidth / 2, cursorY, { align: "center" });
      cursorY += 20;

      // 1. User Score Breakdown
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("User Score Breakdown", 20, cursorY);
      cursorY += 10;

      let tier = "Novice Defender";
      if (xp > 100) tier = "Intermediate Analyst";
      if (xp > 300) tier = "Advanced Security Operative";
      if (xp > 800) tier = "Cyber Elite";
      const threatRatio = totalScans ? Math.round((threatsCaught / totalScans) * 100) : 0;

      pdf.setFontSize(12);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`• Performance Tier: ${tier}`, 25, cursorY);
      cursorY += 8;
      pdf.text(`• Total Awareness XP: ${xp} XP`, 25, cursorY);
      cursorY += 8;
      pdf.text(`• Current Defense Streak: ${streak} Days`, 25, cursorY);
      cursorY += 8;
      pdf.text(`• Scans Conducted: ${totalScans} Items`, 25, cursorY);
      cursorY += 8;
      pdf.text(`• Detection Rate: ${threatRatio}% (${threatsCaught} Threats Caught)`, 25, cursorY);
      cursorY += 12;

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Identified Weak Spots", 25, cursorY);
      cursorY += 8;

      pdf.setFontSize(12);
      pdf.setTextColor(60, 60, 60);
      weakSpotsData.forEach(ws => {
        pdf.text(`• ${ws.name}: ${ws.value} Incidents`, 30, cursorY);
        cursorY += 8;
      });
      cursorY += 6;

      // 2. Threat Summary (AI Analysis)
      checkPageBreak();
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("AI Threat Summary", 20, cursorY);
      cursorY += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(60, 60, 60);
      const splitTip = pdf.splitTextToSize(`Analysis: ${aiTip}`, pageWidth - 40);
      pdf.text(splitTip, 25, cursorY);
      cursorY += (splitTip.length * 7) + 10;

      // 3. History Optimized
      checkPageBreak(20);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Recent Scan History", 20, cursorY);
      cursorY += 10;

      if (history.length === 0) {
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text("No history recorded yet.", 25, cursorY);
      } else {
        // Table Header
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'bold');
        pdf.text("Date", 25, cursorY);
        pdf.text("Category", 90, cursorY);
        pdf.text("Severity", 140, cursorY);
        pdf.text("XP", 180, cursorY);
        cursorY += 6;
        
        pdf.line(25, cursorY, pageWidth - 20, cursorY);
        cursorY += 6;

        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(60, 60, 60);

        history.slice(0, 50).forEach((item) => {
          checkPageBreak(10);
          
          const dateStr = new Date(item.timestamp).toLocaleDateString();
          pdf.text(dateStr, 25, cursorY);
          pdf.text(item.category || "Unknown", 90, cursorY);
          pdf.text(item.severity || "None", 140, cursorY);
          pdf.text(`+${item.xpEarned || 0}`, 180, cursorY);
          
          cursorY += 8;
        });
      }

      pdf.save('CyberGuard_Optimized_Report.pdf');
    } catch (err) {
      console.error("Native PDF Export Error:", err);
      alert('Failed to construct PDF document');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12" ref={dashboardRef}>
      <div className="flex justify-between items-center bg-[var(--bg-color)] py-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-secondary-color mt-1">Track your awareness score and threat history over time.</p>
        </div>
        <button onClick={handleExportPDF} className="btn btn-secondary border-indigo-500/30 text-indigo-400 group">
          <Download size={18} className="group-hover:animate-bounce" /> Export PDF
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Scans', value: totalScans, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Threats Caught', value: threatsCaught, icon: Target, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Current Streak', value: streak + ' Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Awareness XP', value: xp, icon: Shield, color: 'text-green-500', bg: 'bg-green-500/10' }
        ].map((stat, i) => (
          <div key={i} className="surface-card p-6 flex items-center gap-4 animate-slideUpFade" style={{ animationDelay: `${i * 50}ms` }}>
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-sm font-semibold text-secondary-color uppercase tracking-wider">{stat.label}</div>
              <div className="text-2xl font-bold mt-1">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* XP Chart */}
        <div className="surface-card p-6 xl:col-span-2">
          <h3 className="text-lg font-bold mb-6">XP Progression (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getGraphData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px' }} 
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="xp" stroke="var(--color-primary)" strokeWidth={3} dot={{ fill: 'var(--color-primary)', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart & Tips */}
        <div className="surface-card p-6 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <BrainCircuit size={120} />
          </div>
          <h3 className="text-lg font-bold w-full mb-2 z-10">Your Weak Spots</h3>
          
          <div className="h-48 w-full z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={weakSpotsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {weakSpotsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full flex justify-center gap-4 mb-4 text-xs z-10">
            {weakSpotsData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1 text-secondary-color">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                {entry.name}
              </div>
            ))}
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl z-10 w-full mt-auto">
            <div className="text-xs font-bold text-indigo-400 uppercase mb-1 flex items-center gap-1">
              <BrainCircuit size={14} /> AI Analysis
            </div>
            <p className="text-sm text-indigo-100">{aiTip}</p>
          </div>
        </div>
      </div>

      {/* History Table / Quiz History */}
      <div className="surface-card overflow-hidden text-sm">
        <div className="p-6 border-b border-soft flex justify-between items-center">
          <div className="flex gap-4">
            <button 
              onClick={() => setHistoryTab('scans')}
              className={`text-lg font-bold transition-colors ${historyTab === 'scans' ? 'text-[var(--text-primary)]' : 'text-secondary-color hover:text-[var(--text-primary)]'}`}
            >
              Recent Scans
            </button>
            <div className="w-px h-6 bg-[var(--border-color)]"></div>
            <button 
              onClick={() => setHistoryTab('quizzes')}
              className={`text-lg font-bold transition-colors ${historyTab === 'quizzes' ? 'text-[var(--text-primary)]' : 'text-secondary-color hover:text-[var(--text-primary)]'}`}
            >
              Quiz History
            </button>
          </div>
        </div>
        
        {historyTab === 'scans' ? (
          history.length === 0 ? (
            <div className="p-8 text-center text-secondary-color">
              <Shield size={48} className="mx-auto mb-3 opacity-20" />
              <p>No history found. Try analysing a threat first!</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--border-color)]/20 text-left">
                  <th className="px-6 py-4 font-semibold text-secondary-color">Date</th>
                  <th className="px-6 py-4 font-semibold text-secondary-color">Content Preview</th>
                  <th className="px-6 py-4 font-semibold text-secondary-color">Category</th>
                  <th className="px-6 py-4 font-semibold text-secondary-color">Severity</th>
                  <th className="px-6 py-4 font-semibold text-secondary-color text-right">XP Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-secondary-color">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-[var(--text-primary)]">
                      {item.content}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold
                        ${item.category === 'Phishing' ? 'bg-red-500/10 text-red-500' :
                        item.category === 'Malware' ? 'bg-orange-500/10 text-orange-500' :
                        item.category === 'Safe' ? 'bg-green-500/10 text-green-500' :
                        'bg-yellow-500/10 text-yellow-500'}`
                      }>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-secondary-color">
                      {item.severity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-green-400">
                      +{item.xpEarned}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )
        ) : (
          quizHistory.length === 0 ? (
            <div className="p-8 text-center text-secondary-color">
              <Target size={48} className="mx-auto mb-3 opacity-20" />
              <p>No quiz history found. Try taking a Cyber Quiz first!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--border-color)]/20 text-left">
                    <th className="px-6 py-4 font-semibold text-secondary-color">Date</th>
                    <th className="px-6 py-4 font-semibold text-secondary-color">Score</th>
                    <th className="px-6 py-4 font-semibold text-secondary-color">Accuracy</th>
                    <th className="px-6 py-4 font-semibold text-secondary-color">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft">
                  {quizHistory.slice(0, 10).map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-secondary-color">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-[var(--color-primary)]">
                        +{item.score} XP
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary-color">
                        {item.accuracy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
