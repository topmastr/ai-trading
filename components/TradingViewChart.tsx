import React, { useEffect, useRef } from 'react';

const TradingViewChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.querySelector('script')) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": "OANDA:XAUUSD",
        "interval": "60",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "ar_AE",
        "enable_publishing": false,
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": true, // User needs to save image to upload it
        "calendar": false,
        "hide_volume": false,
        "support_host": "https://www.tradingview.com"
      });
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-dark-card" style={{ minHeight: '500px' }}>
      <div className="tradingview-widget-container h-full w-full" ref={containerRef}>
        <div className="tradingview-widget-container__widget h-full w-full"></div>
      </div>
    </div>
  );
};

export default TradingViewChart;
