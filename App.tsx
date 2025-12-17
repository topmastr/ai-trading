import React, { useState, useEffect } from 'react';
import TradingViewChart from './components/TradingViewChart';
import ImageAnalyzer from './components/ImageAnalyzer';
import MoneyManager from './components/MoneyManager';
import NewsFeed from './components/NewsFeed';
import TradeHistory from './components/TradeHistory';
import SystemBoot from './components/SystemBoot';
import AuthGate from './components/AuthGate';
import SettingsPanel from './components/SettingsPanel';
import { BarChart3, Settings, User, Radio, Activity, Zap } from 'lucide-react';
import { TradeSetup } from './types';

const App: React.FC = () => {
  const [booted, setBooted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<TradeSetup[]>([]);
  const [accountBalance, setAccountBalance] = useState<number>(50);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('trade_history');
      if (savedHistory) setTradeHistory(JSON.parse(savedHistory));
      const savedBalance = localStorage.getItem('account_balance');
      if (savedBalance) setAccountBalance(Number(savedBalance));
    } catch (e) {
      console.error("Failed to load data", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('account_balance', accountBalance.toString());
  }, [accountBalance]);

  const handleTradeGenerated = (trade: TradeSetup) => {
    const updatedHistory = [trade, ...tradeHistory];
    setTradeHistory(updatedHistory);
    localStorage.setItem('trade_history', JSON.stringify(updatedHistory));
  };

  const handleTradeOutcome = (index: number, outcome: 'WIN' | 'LOSS') => {
    const trade = tradeHistory[index];
    if (!trade || trade.status !== 'PENDING') return;
    let newBalance = accountBalance;
    if (outcome === 'WIN') newBalance += trade.potentialProfit || 0;
    else newBalance -= trade.riskAmount || 0;
    const updatedHistory = [...tradeHistory];
    updatedHistory[index] = { ...trade, status: outcome };
    setTradeHistory(updatedHistory);
    setAccountBalance(Number(newBalance.toFixed(2)));
    localStorage.setItem('trade_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if (window.confirm("Reset everything?")) {
      setTradeHistory([]);
      setAccountBalance(50);
      localStorage.removeItem('trade_history');
      localStorage.removeItem('account_balance');
    }
  };

  if (!booted) return <SystemBoot onComplete={() => setBooted(true)} />;
  if (!authenticated) return <AuthGate onLogin={() => setAuthenticated(true)} />;

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-gold-500 selection:text-black flex flex-col overflow-x-hidden">
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* Top Navbar - Glass */}
      <header className="h-16 fixed top-0 w-full z-50 px-6 flex items-center justify-between glass-panel border-b-0 rounded-none bg-dark-glass/80">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <BarChart3 className="text-black w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-white leading-none">
              XAU-INTEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600">PRO</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-slate-400 tracking-widest uppercase font-mono">System Online</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           {/* Balance Display */}
           <div className="hidden md:flex flex-col items-end">
             <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Available Capital</span>
             <span className="text-lg font-mono text-white font-bold tracking-wide">${accountBalance.toFixed(2)}</span>
           </div>

           <div className="h-8 w-px bg-white/10 hidden md:block"></div>

           <div className="flex items-center gap-3">
               <button 
                 onClick={() => setShowSettings(true)}
                 className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 hover:text-white text-slate-400 transition border border-white/5"
               >
                 <Settings className="w-5 h-5" />
               </button>
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-inner">
                  <User className="w-5 h-5 text-slate-400" />
               </div>
           </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="pt-24 px-4 pb-12 max-w-[2000px] mx-auto w-full flex-1 flex flex-col gap-6">
        
        {/* Top Row: Chart + Analyzer */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-auto xl:h-[650px]">
          {/* Chart (8 cols) */}
          <div className="xl:col-span-8 h-[500px] xl:h-full relative group rounded-2xl overflow-hidden shadow-2xl border border-white/5">
             <div className="absolute inset-0 bg-gold-500/5 pointer-events-none z-0"></div>
            <TradingViewChart />
          </div>
          
          {/* Analyzer (4 cols) */}
          <div className="xl:col-span-4 h-full">
            <ImageAnalyzer 
              onTradeGenerated={handleTradeGenerated} 
              accountBalance={accountBalance}
              onOpenSettings={() => setShowSettings(true)}
            />
          </div>
        </div>

        {/* Middle Row: News + Money Mgmt */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-7 h-[450px]">
            <NewsFeed />
          </div>
          <div className="xl:col-span-5 h-[450px]">
            <MoneyManager currentBalance={accountBalance} />
          </div>
        </div>

        {/* Bottom: History */}
        <div className="w-full">
          <TradeHistory 
            trades={tradeHistory} 
            onClear={clearHistory} 
            onOutcome={handleTradeOutcome}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="h-10 glass-panel border-t border-white/5 flex items-center justify-between px-6 text-[10px] text-slate-500 font-mono mt-auto backdrop-blur-md">
        <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
                <Radio className="w-3 h-3 text-green-500" />
                SIGNAL: STRONG (-85dBm)
            </span>
            <span className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-gold-500" />
                ENGINE: ONLINE
            </span>
        </div>
        <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span>POWERED BY GOOGLE GEMINI 2.5</span>
        </div>
      </footer>
    </div>
  );
};

export default App;