import { GoogleGenAI, Modality } from "@google/genai";
import { TradeSetup, NewsItem, TradingStyle } from "../types";

// Initialize with env var safely, fallback to empty
let DYNAMIC_API_KEY = '';
try {
  DYNAMIC_API_KEY = process.env.API_KEY || '';
} catch (e) {
  // process undefined in browser
}

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

export const hasApiKey = () => !!DYNAMIC_API_KEY && DYNAMIC_API_KEY.length > 5;

/**
 * Utility for retrying API calls on transient errors (429, 500, 503)
 */
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error?.status || (error?.message?.match(/\d{3}/)?.[0] ? parseInt(error.message.match(/\d{3}/)?.[0]) : 0);
      const message = error?.message || "";
      
      // Retry on Quota Exceeded (429), Internal Error (500), or Service Overloaded (503)
      if (status === 429 || status === 500 || status === 503 || 
          message.includes("429") || message.includes("500") || message.includes("503") || 
          message.toLowerCase().includes("overloaded") || message.toLowerCase().includes("internal error")) {
        console.warn(`API Error ${status} (Attempt ${i + 1}/${maxRetries}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; 
        continue;
      }
      throw error; 
    }
  }
  throw lastError;
}

/**
 * Professional XAUUSD Chart Analyzer using Gemini 3 Pro
 */
export const analyzeChartImage = async (base64Image: string, style: TradingStyle = 'DAY_TRADING'): Promise<TradeSetup> => {
  if (!DYNAMIC_API_KEY) throw new Error("CRITICAL: API Key is missing. Please configure it in System Settings.");

  const ai = new GoogleGenAI({ apiKey: DYNAMIC_API_KEY });
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  const prompt = `
    SYSTEM IDENTITY: You are XAU-INTEL CORE AI, the most advanced Gold (XAUUSD) trading algorithm.
    TRADING STYLE: **${style}**
    
    STRATEGIES TO APPLY:
    1. ICT/SMC: Liquidity Sweeps (BSL/SSL), Order Blocks (OB), Fair Value Gaps (FVG), Market Structure Shift (MSS).
    2. R3D System: 3-day cycle analysis and depth/delivery metrics.
    3. SMS Strategy: Focus on Structure, Momentum, and detecting Smart Money Traps.
    4. Support & Resistance: High-timeframe supply/demand zones.

    TASK: Perform a deep computer-vision analysis on this chart.
    Identify:
    - Current Market Structure (Bullish/Bearish/Neutral).
    - Liquidity pools that have been taken or are targets.
    - Specific POI (Point of Interest) for entry.
    - Risk/Reward metrics.

    RETURN FORMAT (JSON ONLY):
    {
      "type": "BUY" | "SELL" | "WAIT",
      "entryPrice": "string",
      "stopLoss": "string",
      "takeProfit1": "string",
      "takeProfit2": "string",
      "takeProfit3": "string",
      "riskRewardRatio": "string",
      "confidence": number,
      "reasoning": "Detailed breakdown in Arabic and English technical terms.",
      "timeframe": "string",
      "confluences": ["string"],
      "strategies": ["ICT", "SMS", "R3D"],
      "session": "string",
      "expected_return": "string",
      "max_drawdown": "string"
    }
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 1024 },
        systemInstruction: "You are a professional Hedge Fund AI. Return RAW JSON only. Use technical ICT/SMC terminology."
      }
    });

    let text = response.text || "";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text) as TradeSetup;
  });
};

/**
 * Text-to-Speech (TTS) for Trade Alerts
 */
export const playTradeAlert = async (trade: TradeSetup) => {
  if (trade.type === 'WAIT') return;

  const textToSay = `XAU Intel Signal Detected. ${trade.type} Gold at ${trade.entryPrice}. Target one at ${trade.takeProfit1}. Stop loss at ${trade.stopLoss}. Confidence ${trade.confidence} percent.`;

  // Fallback to Web Speech API if Gemini TTS fails or if key is missing
  const fallbackSpeech = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSay);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!DYNAMIC_API_KEY) {
    fallbackSpeech();
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: DYNAMIC_API_KEY });
    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly: ${textToSay}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } else {
      fallbackSpeech();
    }
  } catch (error) {
    console.error("Gemini TTS Error, falling back to Web Speech API:", error);
    fallbackSpeech();
  }
};

/**
 * Audio Decoding Utilities
 */
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Fetches and analyzes fundamental news for Gold.
 */
export const fetchMarketNews = async (): Promise<NewsItem[]> => {
  if (!DYNAMIC_API_KEY) return [];

  const ai = new GoogleGenAI({ apiKey: DYNAMIC_API_KEY });
  const prompt = "Find breaking news for XAUUSD, DXY, CPI, and FOMC. Analyze the impact on Gold prices.";

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `Return a JSON array. 
        Schema: [{"title": "string", "impact": "HIGH"|"MEDIUM"|"LOW", "summary": "string", "sentiment": "POSITIVE"|"NEGATIVE"|"NEUTRAL"}]`
      }
    });

    let text = response.text || "";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const news = JSON.parse(text) as NewsItem[];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && chunks.length > 0) {
        return news.map((item, index) => ({
          ...item,
          url: chunks[index % chunks.length]?.web?.uri || ''
        }));
      }
      return news;
    } catch (e) {
      return [];
    }
  });
};
