import { GoogleGenAI } from "@google/genai";
import { TradeSetup, NewsItem, TradingStyle } from "../types";

// Initialize with env var, fallback to empty
let DYNAMIC_API_KEY = process.env.API_KEY || '';

// Persistence Key
const STORAGE_KEY = 'xau_intel_api_key';

// Load from storage if available (Client-side only)
if (typeof window !== 'undefined') {
  const savedKey = localStorage.getItem(STORAGE_KEY);
  if (savedKey) {
    DYNAMIC_API_KEY = savedKey.trim();
  }
}

export const setApiKey = (key: string) => {
  const cleanKey = key.trim();
  DYNAMIC_API_KEY = cleanKey;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, cleanKey);
  }
};

export const hasApiKey = () => !!DYNAMIC_API_KEY;

/**
 * Analyzes a chart screenshot (1H) to generate a professional ICT/Smart Money trade setup.
 */
export const analyzeChartImage = async (base64Image: string, style: TradingStyle = 'DAY_TRADING'): Promise<TradeSetup> => {
  if (!DYNAMIC_API_KEY) throw new Error("CRITICAL: API Key is missing. Please configure it in System Settings.");

  const ai = new GoogleGenAI({ apiKey: DYNAMIC_API_KEY });

  // Remove header if present (e.g., "data:image/png;base64,")
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  // Specific instructions based on trading style
  let strategyFocus = "";
  if (style === 'SCALPING') {
    strategyFocus = "Focus on M1/M5/M15 timeframes. Look for quick Liquidity Sweeps and immediate Displacement. Targets should be near-term liquidity (10-30 pips). Stop Loss must be tight.";
  } else if (style === 'DAY_TRADING') {
    strategyFocus = "Focus on H1/H4 market structure. Look for Daily Bias alignment, Session Liquidity (London/NY Open), and FVG retests. Targets are previous session Highs/Lows.";
  } else if (style === 'SWING') {
    strategyFocus = "Focus on Daily/Weekly Order Blocks. Ignore intraday noise. Look for major trend reversals or continuations. Targets are major Swing Highs/Lows (100+ pips).";
  }

  const prompt = `
    SYSTEM IDENTITY: You are XAU-INTEL AI, the world's most advanced Gold (XAUUSD) trading algorithm.
    TRADING STYLE: **${style}**
    ${strategyFocus}

    TRAINING DATA: You have been trained on 20 years of tick-by-tick XAUUSD historical data, institutional order flow logs, and central bank policies.
    STRATEGY: You strictly apply ICT (Inner Circle Trader) and SMC (Smart Money Concepts).

    TASK: Perform a deep computer-vision analysis on this chart image.

    THINKING PROCESS (INTERNAL):
    1. Identify Market Structure (Bullish/Bearish) relative to the selected TRADING STYLE.
    2. Locate Liquidity Pools (BSL/SSL) that have been swept or are targets.
    3. Identify the specific PD Array (Order Block, FVG, Breaker) causing the reaction.
    4. Calculate precise fibonacci levels for entry/exit.
    5. Determine invalidation level (Stop Loss) strictly based on structure.

    MANDATORY CHECKS (FAIL IF NOT MET):
    1. **Structure**: Is there a clear Break of Structure (BOS) or Market Structure Shift (MSS)?
    2. **Liquidity**: Has Buy-side (BSL) or Sell-side Liquidity (SSL) been swept?
    3. **POI**: Is price reacting to a high-probability Order Block (OB) or Fair Value Gap (FVG)?
    4. **Premium/Discount**: Is the setup in a valid Premium (for shorts) or Discount (for longs) zone?

    STRICT FILTERING:
    - If the setup is "choppy", "ranging without direction", or low probability (< 80%), RETURN "WAIT".
    - Do not force a trade. Capital preservation is priority #1.

    OUTPUT OBJECTIVES:
    - **Entry**: Limit order at the specific PD Array (e.g., FVG Open).
    - **Stop Loss**: Invalidation point (e.g., Swing High/Low).
    - **Targets**: 
        - TP1: First internal liquidity / Safe Take Profit.
        - TP2: 1:3 Risk:Reward / Standard Target.
        - TP3: External range liquidity / Runner.

    RETURN FORMAT (JSON ONLY):
    {
      "type": "BUY" | "SELL" | "WAIT",
      "entryPrice": "2345.50",
      "stopLoss": "2340.00",
      "takeProfit1": "2350.00",
      "takeProfit2": "2360.00",
      "takeProfit3": "2375.00",
      "riskRewardRatio": "1:3.0",
      "confidence": 92,
      "reasoning": "Detailed breakdown in Arabic. Use ICT terms: 'Judas Swing detected', 'Mitigation of 4H OB', 'Displacement confirmed'.",
      "timeframe": "15M",
      "confluences": ["Liquidity Sweep", "Daily Bias Bullish", "FVG Inversion", "Volume Spike"],
      "strategies": ["ICT Power of 3", "SMC Reversal"],
      "session": "London Open",
      "expected_return": "2.5%",
      "max_drawdown": "12 pips"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', 
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        // Enable thinking to allow the model to reason before outputting JSON.
        // This improves accuracy for complex chart analysis.
        thinkingConfig: { thinkingBudget: 1024 }, 
        systemInstruction: "You are a specialized Hedge Fund AI. Return RAW JSON only. No Markdown. No Explanations outside JSON."
      }
    });

    let text = response.text;
    if (!text) throw new Error("Neural Engine returned empty response.");

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text) as TradeSetup;
  } catch (error: any) {
    console.error("AI Analysis Error Details:", error);
    
    let userMessage = "Analysis Failed: Neural Engine connection interrupted.";
    const errString = error.message || error.toString();

    if (errString.includes("404") || errString.includes("not found")) {
        userMessage = "Model Error: 'gemini-2.5-flash' unavailable. Please check your API access.";
    } else if (errString.includes("403") || errString.includes("permission") || errString.includes("key")) {
        userMessage = "Access Denied: Invalid API Key. Please verify settings.";
    } else if (errString.includes("429") || errString.includes("Quota")) {
        userMessage = "Quota Exceeded: Too many requests. Please wait a moment.";
    } else if (errString.includes("fetch failed")) {
        userMessage = "Network Error: Unable to connect to Google AI servers.";
    } else {
        userMessage = `System Error: ${errString.substring(0, 50)}...`;
    }
    
    throw new Error(userMessage);
  }
};

/**
 * Fetches and analyzes fundamental news for Gold.
 */
export const fetchMarketNews = async (): Promise<NewsItem[]> => {
  if (!DYNAMIC_API_KEY) return [];

  const ai = new GoogleGenAI({ apiKey: DYNAMIC_API_KEY });
  const prompt = "Find breaking news for XAUUSD, USD Index (DXY), and Federal Reserve. Analyze sentiment impact on Gold price.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `Return a JSON array of news items. 
        Schema: [{"title": "string", "impact": "HIGH"|"MEDIUM"|"LOW", "summary": "string", "sentiment": "POSITIVE"|"NEGATIVE"|"NEUTRAL"}]
        Strictly JSON.`
      }
    });

    let text = response.text;
    if (!text) return [];

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let news: NewsItem[] = [];
    try {
        news = JSON.parse(text) as NewsItem[];
    } catch (e) {
        return [];
    }
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
        return news.map((item, index) => ({
            ...item,
            url: chunks[index % chunks.length]?.web?.uri || ''
        }));
    }

    return news;
  } catch (error) {
    console.error("News Engine Error:", error);
    return [];
  }
};