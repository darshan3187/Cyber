import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { classifyThreat } from '../utils/anthropic';
import Tesseract from 'tesseract.js';
import { 
  Upload, ScanSearch, 
  AlertTriangle, ShieldCheck, AlertCircle, Info, ChevronRight, Check
} from 'lucide-react';

const SIMULATIONS = [
  {
    type: 'Email',
    title: 'PayPal Password Reset',
    content: 'URGENT: Your PayPal account has been restricted due to suspicious activity. Click here to verify your identity immediately: http://paypa1-secure-login.verify-account.com/confirm?user=you\n\nIf you do not verify within 24 hours, your account will be permanently closed.\n\nThanks,\nPayPal Security Team'
  },
  {
    type: 'URL',
    title: 'Google Drive Share',
    content: 'https://googledrive-shares-secure.document-view.net/login?token=abc891'
  },
  {
    type: 'Email',
    title: 'IT Helpdesk',
    content: 'Hi Team,\n\nWe are migrating to a new email server tonight. Please confirm your current password by replying to this email so we can ensure your account is successfully migrated.\n\nRegards,\nIT Department'
  },
  {
    type: 'Message',
    title: 'Prize Winner',
    content: 'CONGRATS! You are the 100th shopper today and won a free iPhone 15 Pro! Claim it here: http://bit.ly/free-phone-9912'
  },
  {
    type: 'Message',
    title: 'Bank OTP Fake',
    content: 'CHASE BANK: A login attempt was made from an unrecognized device in Russia. If this was not you, please reply with your 6-digit 2FA code to cancel the login.'
  }
];

const CategoryColors = {
  'Phishing': { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-500', name: 'Phishing', icon: AlertTriangle },
  'Malware': { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500', name: 'Malware', icon: AlertCircle },
  'Social Engineering': { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-500', name: 'Social Engineering', icon: Info },
  'Safe': { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-500', name: 'Safe', icon: ShieldCheck }
};

const AnalysePage = () => {
  const { 
    addXp, addHistory,
    analyzerInput: inputText, setAnalyzerInput: setInputText,
    analyzerResult: result, setAnalyzerResult: setResult,
    analyzerSimulationActive: simulationActive, setAnalyzerSimulationActive: setSimulationActive,
    analyzerPrediction: prediction, setAnalyzerPrediction: setPrediction,
    analyzerActiveTab: activeTab, setAnalyzerActiveTab: setActiveTab
  } = useApp();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOcring, setIsOcring] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsOcring(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
      });
      setInputText(text);
    } catch (err) {
      console.error(err);
      alert('Failed to extract text from image');
    } finally {
      setIsOcring(false);
    }
  };

  const handleClear = () => {
    setActiveTab('General');
    setInputText('');
    setSimulationActive(null);
    setResult(null);
    setPrediction(null);
  };

  const loadSimulation = () => {
    const random = SIMULATIONS[Math.floor(Math.random() * SIMULATIONS.length)];
    setActiveTab('General');
    setInputText(random.content);
    setSimulationActive(random);
    setResult(null);
    setPrediction(null);
  };

  const handleAnalyse = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    // Give visual delay for mock API
    await new Promise(r => setTimeout(r, 600));

    try {
      const allowedTypes = ['url', 'email', 'message', 'text'];
      const requestType = allowedTypes.includes(activeTab?.toLowerCase()) ? activeTab.toLowerCase() : 'text';
      
      const classification = await classifyThreat(inputText, requestType);
      setResult(classification);
      
      // Calculate XP
      let xpEarned = 10;
      if (prediction) {
        if (classification.category === prediction) {
          xpEarned = 25;
        }
      }

      addXp(xpEarned, simulationActive ? 'Completed Simulation' : 'Analyzed Threat');
      
      addHistory({
        content: inputText.substring(0, 40) + '...',
        fullContent: inputText,
        type: activeTab,
        category: classification.category,
        severity: classification.severity,
        xpEarned,
        isSimulation: !!simulationActive
      });
      
    } catch (err) {
      alert(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Threat Analyzer</h1>
          <p className="text-secondary-color mt-1">Paste a suspicious link, email, or message to scan it with AI.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleClear} className="btn btn-secondary py-2 border-slate-500/30">
            New Content
          </button>
          <button onClick={loadSimulation} className="btn btn-secondary py-2 border-indigo-500/30 text-indigo-400">
            Try a Simulation
          </button>
        </div>
      </div>

      <div className="surface-card p-1">
        <div className="p-6">
          <div className="relative">
            <textarea
              className="w-full h-48 bg-[var(--bg-color)] border border-soft rounded-xl p-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none mb-4"
              placeholder="Paste the suspicious content here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            {isOcring && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center font-medium">
                <ScanSearch className="animate-pulse mr-2" /> Extracting text...
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary border-dashed"
              >
                <Upload size={18} /> Upload Image (OCR)
              </button>
            </div>
            
            <button 
              onClick={handleAnalyse} 
              disabled={isAnalyzing || !inputText.trim()}
              className="btn btn-primary px-8"
            >
              {isAnalyzing ? (
                <><ScanSearch size={20} className="animate-pulse" /> Analyzing...</>
              ) : (
                <><ScanSearch size={20} /> Analyse Threat</>
              )}
            </button>
          </div>
        </div>
      </div>

      {inputText.trim() && !result && !isAnalyzing && (
        <div className="surface-card p-6 border-indigo-500/30 animate-slideUpFade">
          <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
            <ScanSearch size={20} /> Training Simulation Active
          </h3>
          <p className="text-secondary-color mt-2 mb-4">Before we analyze this, what do you think it is?</p>
          <div className="flex gap-3">
            {['Phishing', 'Malware', 'Social Engineering', 'Safe'].map(cat => (
              <button
                key={cat}
                onClick={() => setPrediction(cat)}
                className={`py-2 px-4 rounded-xl font-medium border transition-colors ${
                  prediction === cat 
                    ? 'bg-indigo-500 text-white border-indigo-500' 
                    : 'border-soft text-secondary-color hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Skeletons */}
      {isAnalyzing && (
        <div className="surface-card p-6 space-y-4 animate-pulse">
          <div className="h-8 bg-[var(--border-color)] rounded-md w-1/4"></div>
          <div className="h-4 bg-[var(--border-color)] rounded-md w-3/4"></div>
          <div className="h-4 bg-[var(--border-color)] rounded-md w-full"></div>
          <div className="h-20 bg-[var(--border-color)] rounded-md w-full"></div>
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="surface-card p-0 overflow-hidden animate-slideUpFade">
          <div className={`${CategoryColors[result.category].bg} p-6 border-b border-soft flex items-start justify-between`}>
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl bg-[var(--surface-color)] ${CategoryColors[result.category].text} shadow-xl`}>
                {React.createElement(CategoryColors[result.category].icon, { size: 32 })}
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${CategoryColors[result.category].text}`}>
                  {result.category}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-[var(--surface-color)] ${CategoryColors[result.category].text}`}>
                    Severity: {result.severity}
                  </span>
                  <span className="text-sm font-medium opacity-80 flex items-center gap-1">
                    Confidence: {result.confidence}% 
                  </span>
                </div>
              </div>
            </div>
            
            {prediction && (
              <div className={`px-4 py-2 rounded-xl border ${result.category === prediction ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                <div className="text-xs font-bold uppercase tracking-wider opacity-70">Your prediction</div>
                <div className="font-bold flex items-center gap-1 mt-1">
                  {result.category === prediction ? <Check size={16} /> : <AlertTriangle size={16} />}
                  {result.category === prediction ? 'Correct! (+25 XP)' : `Incorrect`}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Explanation</h3>
              <p className="text-secondary-color leading-relaxed">{result.explanation}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {result.indicators.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-400">
                    <AlertTriangle size={18} /> Red Flags Found
                  </h3>
                  <ul className="space-y-3">
                    {result.indicators.map((indicator, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-secondary-color text-sm">
                        <div className="mt-0.5 bg-red-500/20 text-red-500 p-1 rounded-md">
                          <AlertTriangle size={12} />
                        </div>
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.advice.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-400">
                    <ShieldCheck size={18} /> What To Do
                  </h3>
                  <ul className="space-y-3">
                    {result.advice.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-secondary-color text-sm">
                        <div className="font-bold text-green-500 bg-green-500/10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {result.educational_tip && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3 text-indigo-300">
                <Info size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm"><strong>Pro Tip:</strong> {result.educational_tip}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysePage;
