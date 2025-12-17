import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { MoneyPlanStep } from '../types';
import { TrendingUp, DollarSign, ShieldAlert, Target } from 'lucide-react';

interface MoneyManagerProps {
  currentBalance?: number;
}

const MoneyManager: React.FC<MoneyManagerProps> = ({ currentBalance = 50 }) => {
  const [startBalance, setStartBalance] = useState(currentBalance);
  const [targetBalance, setTargetBalance] = useState(500);
  const [days, setDays] = useState(30);
  const [plan, setPlan] = useState<MoneyPlanStep[]>([]);

  useEffect(() => { setStartBalance(currentBalance); }, [currentBalance]);

  useEffect(() => {
    generatePlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startBalance, targetBalance, days]);

  const generatePlan = () => {
    const rate = Math.pow(targetBalance / startBalance, 1 / days) - 1;
    const steps: MoneyPlanStep[] = [];
    let current = startBalance;

    for (let i = 1; i <= days; i++) {
      const profit = current * rate;
      const end = current + profit;
      const risk = current * 0.05; 
      steps.push({
        day: i,
        startBalance: Math.round(current * 100) / 100,
        targetProfit: Math.round(profit * 100) / 100,
        endBalance: Math.round(end * 100) / 100,
        riskAmount: Math.round(risk * 100) / 100
      });
      current = end;
    }
    setPlan(steps);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
      <div className="mb-6 flex justify-between items-center z-10">
        <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Growth Plan
            </h2>
            <p className="text-[10px] text-slate-400 font-mono mt-1">COMPOUND INTEREST SIMULATOR</p>
        </div>
        <div className="bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
            <span className="text-xs font-mono text-green-400 font-bold">+{(targetBalance/startBalance * 100 - 100).toFixed(0)}% ROI</span>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6 z-10">
        <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 group hover:border-gold-500/30 transition">
          <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Start Capital</label>
          <div className="flex items-center gap-1">
              <span className="text-slate-500 text-sm">$</span>
              <input 
                type="number" 
                value={startBalance} 
                onChange={(e) => setStartBalance(Number(e.target.value))}
                className="w-full bg-transparent text-white font-mono font-bold outline-none"
              />
          </div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 group hover:border-gold-500/30 transition">
          <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Target</label>
          <div className="flex items-center gap-1">
              <span className="text-slate-500 text-sm">$</span>
              <input 
                type="number" 
                value={targetBalance} 
                onChange={(e) => setTargetBalance(Number(e.target.value))}
                className="w-full bg-transparent text-green-400 font-mono font-bold outline-none"
              />
          </div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 group hover:border-gold-500/30 transition">
          <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Duration</label>
          <div className="flex items-center gap-1">
              <input 
                type="number" 
                value={days} 
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full bg-transparent text-white font-mono font-bold outline-none"
              />
              <span className="text-slate-500 text-xs">Days</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 w-full mb-6 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={plan}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#fbbf24' }}
            />
            <Area type="monotone" dataKey="endBalance" stroke="#fbbf24" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* List Header */}
      <div className="grid grid-cols-4 text-[10px] text-slate-500 uppercase tracking-wider pb-2 border-b border-white/5 px-2 z-10">
        <div>Day</div>
        <div>Balance</div>
        <div>Target</div>
        <div className="text-right">Max Risk</div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar z-10">
        {plan.map((step) => (
          <div key={step.day} className="grid grid-cols-4 text-xs px-2 py-2 hover:bg-white/5 rounded transition-colors group">
            <div className="font-mono text-slate-500">#{step.day}</div>
            <div className="font-mono text-white group-hover:text-gold-400 transition">${step.startBalance.toFixed(0)}</div>
            <div className="font-mono text-green-500/80">+${step.targetProfit.toFixed(1)}</div>
            <div className="font-mono text-red-400/80 text-right">${step.riskAmount.toFixed(1)}</div>
          </div>
        ))}
      </div>

      {/* Decor */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-500/5 rounded-full blur-[50px]"></div>
    </div>
  );
};

export default MoneyManager;