import React, { useState } from 'react';
import { Upload, Cpu, AlertTriangle, CheckCircle, Target, Shield, Zap, Scan, Percent, Activity, DollarSign, Settings, BrainCircuit, Clock, Copy, Check, BarChart2, Layers, TrendingUp, RefreshCcw, Volume2 } from 'lucide-react';
import { analyzeChartImage, playTradeAlert } from '../services/geminiService';
import { TradeSetup, AnalysisStatus, TradingStyle } from '../types';

interface ImageAnalyzerProps {
  onTradeGenerated: (trade: TradeSetup) => void;
  accountBalance: number;
  onOpenSettings: () => void;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onTradeGenerated, accountBalance, onOpenSettings }) => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<TradeSetup | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  
  // Advanced Settings
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [strategy, setStrategy] = useState<TradingStyle>('DAY_TRADING');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setResult(null);
        setStatus(AnalysisStatus.IDLE);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateMoneyManagement = (trade: TradeSetup, balance: number, riskPct: number): TradeSetup => {
    try {
        if (trade.type === 'WAIT') return trade;
        const cleanPrice = (price: string) => parseFloat(price.replace(/[^0-9.]/g, ''));
        const entry = cleanPrice(trade.entryPrice);
        const sl = cleanPrice(trade.stopLoss);
        const tpStandard = cleanPrice(trade.takeProfit2) || cleanPrice(trade.takeProfit1);

        if (isNaN(entry) || isNaN(sl) || isNaN(tpStandard)) return trade;

        const riskAmount = balance * (riskPct / 100);
        const slDistanceInDollars = Math.abs(entry - sl);
        
        if (slDistanceInDollars === 0) return trade;

        const rawLotSize = riskAmount / (100 * slDistanceInDollars);
        const lotSize = Math.max(0.01, parseFloat(rawLotSize.toFixed(2)));
        const potentialProfit = lotSize * 100 * Math.abs(tpStandard - entry);

        return {
            ...trade,
            lotSize: lotSize,
            riskAmount: parseFloat(riskAmount.toFixed(2)),
            potentialProfit: parseFloat(potentialProfit.toFixed(2)),
            status: 'PENDING'
        };
    } catch (e) {
        console.warn("Calculation error", e);
        return trade;
    }
  };

  const runAnalysis = async () => {
    if (!preview) return;
    setStatus(AnalysisStatus.ANALYZING);
    setErrorMsg('');
    
    try {
      const data = await analyzeChartImage(preview, strategy);
      
      let tradeWithTime: TradeSetup = {
        ...data,
        timestamp: new Date().toISOString()
      };

      tradeWithTime = calculateMoneyManagement(tradeWithTime, accountBalance, riskPercent);

      setResult(tradeWithTime);
      setStatus(AnalysisStatus.COMPLETED);
      onTradeGenerated(tradeWithTime);
      
      // Auto-speak on completion
      playTradeAlert(tradeWithTime);
    } catch (err: any) {
      setStatus(AnalysisStatus.ERROR);
      let msg = err.message || 'Analysis interrupted.';
      if (msg.includes('429')) msg = "Quota Exceeded: Too many requests. Our AI is retrying or needs a moment to cool down.";
      if (msg.includes('503')) msg = "Server Overloaded: The AI engine is currently busy. Please try again in 30 seconds.";
      setErrorMsg(msg);
    }
  };

  const handleSpeak = async () => {
    if (!result || speaking) return;
    setSpeaking(true);
    await playTradeAlert(result);
    setSpeaking(false);
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `
🏆 *XAU-INTEL PREMIUM*
------------------------
🎯 *${result.type}* @ ${result.entryPrice}
🛑 SL: ${result.stopLoss}
💰 TP1: ${result.takeProfit1}
💰 TP2: ${result.takeProfit2}
🚀 TP3: ${result.takeProfit3 || 'OPEN'}

📝 *Logic:* ${result.reasoning.substring(0, 60)}...
⚖️ R:R: ${result.riskRewardRatio} | Lot: ${result.lotSize}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl h-full flex flex-col relative overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-dark-border z-10 bg-gradient-to-r from-transparent via-gold-500/5 to-transparent">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-gold-500 animate-pulse" />
                    <span className="tracking-tight">XAU-INTEL <span className="text-gradient-gold font-black">AI CORE</span></span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                     <span className="text-[10px] bg-gold-500/10 text-gold-400 px-2 py-0.5 rounded border border-gold-500/20">
                         GEMINI 3 PRO
                     </span>
                     <span className="text-[10px] text-slate-400 font-mono">
                         MULTIMODAL V5
                     </span>
                </div>
            </div>
            
            <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/5">
                <button 
                    onClick={() => setStrategy('SCALPING')}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold transition ${strategy === 'SCALPING' ? 'bg-gold-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >SCALP</button>
                <button 
                    onClick={() => setStrategy('DAY_TRADING')}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold transition ${strategy === 'DAY_TRADING' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >DAY</button>
                <button 
                    onClick={() => setStrategy('SWING')}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold transition ${strategy === 'SWING' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >SWING</button>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-5 gap-4 z-10 overflow-y-auto custom-scrollbar">
        
        <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                 <div className="bg-slate-800/50 p-1.5 rounded-lg border border-white/5">
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                 </div>
                 <div className="flex flex-col">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Risk Profile</span>
                     <div className="flex items-center gap-1">
                        <input 
                            type="number" 
                            value={riskPercent}
                            onChange={(e) => setRiskPercent(Math.max(0.1, Math.min(10, Number(e.target.value))))}
                            className="w-8 bg-transparent text-white font-mono font-bold text-xs outline-none border-b border-slate-700 focus:border-gold-500"
                        />
                        <span className="text-xs text-gold-500">%</span>
                     </div>
                 </div>
             </div>
             
             {result && (
                 <div className="flex items-center gap-3">
                     <button 
                        onClick={handleSpeak}
                        className={`p-2 rounded-lg border border-white/5 transition ${speaking ? 'bg-gold-500 text-black animate-bounce' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        title="Voice Alert"
                     >
                        <Volume2 className="w-4 h-4" />
                     </button>
                     <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">Confidence</span>
                        <div className="flex items-center gap-1">
                            <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-red-500 to-green-500" style={{ width: `${result.confidence}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-white">{result.confidence}%</span>
                        </div>
                     </div>
                 </div>
             )}
        </div>

        {!result && (
            <div className={`relative flex-1 border border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 group cursor-pointer overflow-hidden ${
                preview 
                ? 'border-gold-500/30 bg-black/20' 
                : 'border-slate-700 hover:border-gold-500/50 hover:bg-slate-800/30'
            }`}>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    disabled={status === AnalysisStatus.ANALYZING}
                />
                
                {preview ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                        <img src={preview} alt="Chart" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110" />
                        <img src={preview} alt="Preview" className="relative z-10 max-h-48 rounded-lg shadow-2xl border border-white/10" />
                        
                        {status === AnalysisStatus.ANALYZING && (
                            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <div className="flex flex-col items-center">
                                    <div className="relative w-24 h-24 mb-4">
                                        <div className="absolute inset-0 border-4 border-gold-500/20 rounded-full"></div>
                                        <div className="absolute inset-0 border-t-4 border-gold-500 rounded-full animate-spin"></div>
                                        <BrainCircuit className="absolute inset-0 m-auto text-gold-500 w-10 h-10 animate-pulse" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-bold text-white tracking-widest animate-pulse uppercase">Neural XAU-CORE Scanning</p>
                                        <p className="text-xs text-gold-400 font-mono">Applying ICT/SMS/R3D logic...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="relative z-10 space-y-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-800 to-black border border-white/5 flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition duration-500">
                            <Scan className="w-8 h-8 text-slate-400 group-hover:text-gold-400 transition" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white group-hover:text-gold-100 transition">Drop XAUUSD Chart</p>
                            <p className="text-xs text-slate-400 mt-1">Multi-Strategy AI Recognition</p>
                        </div>
                    </div>
                )}
            </div>
        )}

        {preview && status === AnalysisStatus.IDLE && (
           <button 
             onClick={runAnalysis}
             className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-black text-sm tracking-wider rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
           >
             <BrainCircuit className="w-5 h-5" />
             EXECUTE NEURAL ANALYSIS
           </button>
        )}

        {status === AnalysisStatus.ERROR && (
           <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-start gap-3 backdrop-blur-md animate-in fade-in zoom-in-95">
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-red-400 mb-1">Signal Interrupted</p>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono bg-black/30 p-2 rounded border border-white/5">{errorMsg}</p>
                    <div className="mt-3 flex gap-2">
                        <button onClick={runAnalysis} className="text-xs bg-gold-500/20 border border-gold-500/30 px-3 py-1.5 rounded text-gold-400 hover:bg-gold-500/30 transition flex items-center gap-1.5 font-bold">
                            <RefreshCcw className="w-3 h-3" /> Re-Scan
                        </button>
                        <button onClick={onOpenSettings} className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded text-white hover:bg-white/10 transition">
                            Settings
                        </button>
                    </div>
                </div>
           </div>
        )}

        {result && status === AnalysisStatus.COMPLETED && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-bottom-6 duration-500">
             
             <div className={`relative p-5 rounded-t-2xl border-b border-white/5 flex items-center justify-between overflow-hidden ${
                 result.type === 'BUY' ? 'bg-gradient-to-r from-green-900/40 to-slate-900' :
                 result.type === 'SELL' ? 'bg-gradient-to-r from-red-900/40 to-slate-900' : 
                 'bg-slate-800'
             }`}>
                 <div className={`absolute left-0 top-0 w-1 h-full ${result.type === 'BUY' ? 'bg-green-500' : result.type === 'SELL' ? 'bg-red-500' : 'bg-slate-500'}`}></div>
                 
                 <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${
                         result.type === 'BUY' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                         result.type === 'SELL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                         'bg-slate-700 text-slate-400'
                     }`}>
                         {result.type === 'BUY' ? <TrendingUp className="w-6 h-6" /> : result.type === 'SELL' ? <TrendingUp className="w-6 h-6 rotate-180" /> : <Clock className="w-6 h-6" />}
                     </div>
                     <div>
                         <h3 className={`text-2xl font-black tracking-tighter ${
                             result.type === 'BUY' ? 'text-green-400' : result.type === 'SELL' ? 'text-red-400' : 'text-slate-400'
                         }`}>
                             {result.type} <span className="text-sm font-medium text-white opacity-60">LIMIT</span>
                         </h3>
                         <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded text-slate-300 border border-white/5">
                                 {strategy}
                             </span>
                             <span className="text-[10px] text-gold-500 font-mono">
                                 LOT: {result.lotSize || 'CALC...'}
                             </span>
                         </div>
                     </div>
                 </div>

                 <div className="flex flex-col gap-2">
                     <button onClick={copyToClipboard} title="Copy Signal" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition border border-white/5">
                         {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                     </button>
                     <button onClick={() => {setResult(null); setPreview(null); setStatus(AnalysisStatus.IDLE)}} className="text-[10px] text-slate-500 hover:text-white underline text-center">
                        Clear
                     </button>
                 </div>
             </div>

             <div className="bg-black/20 backdrop-blur-sm border-x border-white/5 p-4 grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                         <Target className="w-3 h-3" /> Entry Price
                     </p>
                     <p className="text-xl font-mono font-bold text-white tracking-wide">{result.entryPrice}</p>
                 </div>
                 <div className="space-y-1 text-right">
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-end gap-1">
                         <Shield className="w-3 h-3 text-red-500" /> Stop Loss
                     </p>
                     <p className="text-xl font-mono font-bold text-red-400 tracking-wide">{result.stopLoss}</p>
                 </div>
             </div>

             <div className="grid grid-cols-3 divide-x divide-white/5 bg-slate-900/40 border-y border-white/5">
                 <div className="p-3 text-center">
                     <span className="text-[9px] text-slate-500 block mb-1">TP1</span>
                     <span className="font-mono text-green-300 text-sm">{result.takeProfit1}</span>
                 </div>
                 <div className="p-3 text-center bg-green-500/5">
                     <span className="text-[9px] text-green-500/70 block mb-1 font-bold">TP2 (PRO)</span>
                     <span className="font-mono text-green-400 font-bold text-sm">{result.takeProfit2}</span>
                 </div>
                 <div className="p-3 text-center">
                     <span className="text-[9px] text-slate-500 block mb-1">TP3</span>
                     <span className="font-mono text-green-500 text-sm">{result.takeProfit3 || '---'}</span>
                 </div>
             </div>

             <div className="flex-1 bg-slate-900/30 rounded-b-2xl p-4 overflow-y-auto custom-scrollbar border-x border-b border-white/5">
                 <div className="mb-4">
                     <h4 className="text-[10px] text-gold-500 uppercase font-bold mb-2 flex items-center gap-2">
                         <Layers className="w-3 h-3" /> Strategic Reasoning
                     </h4>
                     <p className="text-xs text-slate-300 leading-relaxed text-right bg-black/20 p-3 rounded border border-white/5" dir="rtl">
                         {result.reasoning}
                     </p>
                 </div>
                 
                 <div className="flex flex-wrap gap-2">
                     {result.confluences?.map((conf, idx) => (
                         <span key={idx} className="text-[9px] px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400">
                             {conf}
                         </span>
                     ))}
                 </div>
             </div>
          </div>
        )}
      </div>

      <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-full blur-[60px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>
    </div>
  );
};

export default ImageAnalyzer;
