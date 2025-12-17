import React from 'react';
import { TradeSetup } from '../types';
import { History, Trash2, ArrowUpRight, ArrowDownRight, Minus, AlertCircle, Check, X, Target } from 'lucide-react';

interface TradeHistoryProps {
  trades: TradeSetup[];
  onClear: () => void;
  onOutcome: (index: number, outcome: 'WIN' | 'LOSS') => void;
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ trades, onClear, onOutcome }) => {
  return (
    <div className="bg-dark-card rounded-xl p-6 border border-slate-700 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-purple-400" />
          سجل الصفقات (Local Log)
        </h2>
        {trades.length > 0 && (
          <button 
            onClick={onClear} 
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition px-3 py-1 rounded bg-red-900/20 border border-red-900/50"
          >
            <Trash2 className="w-3 h-3" />
            مسح السجل
          </button>
        )}
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        {trades.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
            <History className="w-8 h-8 opacity-20 mb-2" />
            <p className="text-xs">لم يتم تسجيل أي صفقات بعد</p>
          </div>
        ) : (
          <table className="w-full text-right text-sm text-slate-400">
            <thead className="bg-slate-900/50 text-xs uppercase font-mono text-slate-500">
              <tr>
                <th className="px-4 py-3 rounded-tr-lg">Time</th>
                <th className="px-4 py-3">Strategy</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Entry/SL</th>
                <th className="px-4 py-3">Targets (1-3)</th>
                <th className="px-4 py-3 text-gold-500">Lot</th>
                <th className="px-4 py-3 text-green-400">Exp. Profit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-tl-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {trades.map((trade, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition group">
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                    {trade.timestamp ? new Date(trade.timestamp).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                    }) : '-'}
                  </td>
                  <td className="px-4 py-3">
                     {trade.strategies?.[0] ? (
                        <span className="text-[9px] bg-slate-700 px-1.5 py-0.5 rounded border border-slate-600 text-slate-300">
                            {trade.strategies[0]}
                        </span>
                     ) : <span className="text-[9px] text-slate-600">STD</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                        trade.type === 'BUY' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                        trade.type === 'SELL' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        'bg-slate-700/50 border-slate-600 text-slate-400'
                    }`}>
                        {trade.type === 'BUY' && <ArrowUpRight className="w-3 h-3" />}
                        {trade.type === 'SELL' && <ArrowDownRight className="w-3 h-3" />}
                        {trade.type === 'WAIT' && <Minus className="w-3 h-3" />}
                        {trade.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <div className="text-white">{trade.entryPrice}</div>
                    <div className="text-red-400 text-[10px]">{trade.stopLoss}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <div className="flex gap-2">
                        <span className="text-green-300" title="TP1">{trade.takeProfit1}</span>
                        <span className="text-green-400 font-bold" title="TP2">{trade.takeProfit2}</span>
                        {trade.takeProfit3 && <span className="text-green-500" title="TP3">{trade.takeProfit3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-gold-400">
                    {trade.lotSize || '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-green-400">
                    {trade.potentialProfit ? `+$${trade.potentialProfit}` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                        trade.status === 'WIN' ? 'bg-green-500/20 text-green-400' :
                        trade.status === 'LOSS' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                    }`}>
                        {trade.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                     {(!trade.status || trade.status === 'PENDING') && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => onOutcome(idx, 'WIN')} className="p-1 rounded bg-green-500/20 hover:bg-green-500/40 text-green-400 transition" title="TP Hit">
                                <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => onOutcome(idx, 'LOSS')} className="p-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-400 transition" title="SL Hit">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
