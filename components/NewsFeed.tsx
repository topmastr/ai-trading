import React, { useEffect, useState } from 'react';
import { Newspaper, RefreshCw, ExternalLink, Globe, TrendingUp, TrendingDown, Minus, Gauge } from 'lucide-react';
import { fetchMarketNews } from '../services/geminiService';
import { NewsItem } from '../types';

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentimentScore, setSentimentScore] = useState<number>(50); // 0 (Bearish) - 100 (Bullish)

  const loadNews = async () => {
    setLoading(true);
    const data = await fetchMarketNews();
    setNews(data);
    calculateSentiment(data);
    setLoading(false);
  };

  const calculateSentiment = (items: NewsItem[]) => {
    if (items.length === 0) {
        setSentimentScore(50);
        return;
    }

    let score = 50;
    items.forEach(item => {
        let weight = item.impact === 'HIGH' ? 10 : item.impact === 'MEDIUM' ? 5 : 2;
        if (item.sentiment === 'POSITIVE') score += weight;
        if (item.sentiment === 'NEGATIVE') score -= weight;
    });

    // Clamp between 0 and 100
    setSentimentScore(Math.max(0, Math.min(100, score)));
  };

  useEffect(() => {
    loadNews();
  }, []);

  // Determine sentiment properties
  const isBullish = sentimentScore > 55;
  const isBearish = sentimentScore < 45;
  const sentimentText = isBullish ? 'BULLISH' : isBearish ? 'BEARISH' : 'NEUTRAL';
  const sentimentColor = isBullish ? 'text-green-500' : isBearish ? 'text-red-500' : 'text-slate-400';
  const meterColor = isBullish ? 'bg-green-500' : isBearish ? 'bg-red-500' : 'bg-slate-500';

  return (
    <div className="bg-dark-card rounded-xl p-0 border border-slate-700 h-full flex flex-col overflow-hidden">
      {/* Terminal Header */}
      <div className="flex flex-col border-b border-slate-700 bg-slate-900/50">
          <div className="flex justify-between items-center p-4 pb-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Globe className="w-4 h-4 text-blue-500" />
              Global Market News
            </h2>
            <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[10px] text-green-500 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    LIVE
                </span>
                <button 
                onClick={loadNews} 
                disabled={loading}
                className={`p-1.5 rounded hover:bg-slate-800 text-slate-400 transition ${loading ? 'animate-spin' : ''}`}
                >
                <RefreshCw className="w-3 h-3" />
                </button>
            </div>
          </div>
          
          {/* Sentiment Meter */}
          <div className="px-4 pb-4">
             <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] text-slate-500 font-mono">MARKET BIAS</span>
                <span className={`text-xs font-bold font-mono ${sentimentColor}`}>{sentimentText} ({sentimentScore}%)</span>
             </div>
             <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                    className={`h-full transition-all duration-1000 ${meterColor} shadow-[0_0_10px_currentColor]`} 
                    style={{ width: `${sentimentScore}%` }}
                ></div>
             </div>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/20">
        {loading && news.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
            <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono">SCANNING NEWS WIRES...</p>
          </div>
        ) : news.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {news.map((item, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-800/30 transition group">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                                item.impact === 'HIGH' ? 'bg-red-500 text-black' :
                                item.impact === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                'bg-slate-700 text-slate-300'
                            }`}>
                                {item.impact} IMPACT
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{new Date().toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-200 leading-snug mb-1 group-hover:text-blue-400 transition">
                            {item.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                            {item.summary}
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        {item.sentiment === 'POSITIVE' && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {item.sentiment === 'NEGATIVE' && <TrendingDown className="w-4 h-4 text-red-500" />}
                        {item.sentiment === 'NEUTRAL' && <Minus className="w-4 h-4 text-slate-500" />}
                        
                        {item.url && (
                             <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-white transition">
                                <ExternalLink className="w-3 h-3" />
                             </a>
                        )}
                    </div>
                </div>
                </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <Globe className="w-8 h-8 opacity-20 mb-2" />
             <p className="text-xs">NO NEWS DATA AVAILABLE</p>
          </div>
        )}
      </div>
      
      {/* Ticker Footer */}
      <div className="bg-black py-1 px-4 border-t border-slate-800 overflow-hidden whitespace-nowrap">
         <div className="inline-block animate-marquee text-[10px] font-mono text-slate-500">
            XAUUSD: $2345.50 (+0.5%)  |  DXY: 104.20 (-0.1%)  |  US10Y: 4.25% (+0.2%)  |  SYSTEM: OPTIMIZED
         </div>
      </div>
      <style>{`
        .animate-marquee {
            animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default NewsFeed;