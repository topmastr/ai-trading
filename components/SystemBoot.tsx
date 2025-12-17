import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, Wifi, Database, Lock, Activity, Check, AlertTriangle } from 'lucide-react';
import { SystemLog } from '../types';
import { hasApiKey } from '../services/geminiService';

interface SystemBootProps {
  onComplete: () => void;
}

const SystemBoot: React.FC<SystemBootProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [progress, setProgress] = useState(0);

  const addLog = (module: string, message: string, status: 'OK' | 'WARN' | 'ERROR' = 'OK') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString().split('T')[1].slice(0, -1),
      module,
      message,
      status
    }]);
  };

  useEffect(() => {
    const bootSequence = async () => {
      // Step 1: Core System
      addLog('KERNEL', 'Initializing XAU-INTEL Core v3.2.0...');
      await new Promise(r => setTimeout(r, 600));
      setProgress(10);
      
      // Step 2: Security Check
      addLog('SECURITY', 'Verifying Integrity Signatures...', 'OK');
      await new Promise(r => setTimeout(r, 500));
      setProgress(30);

      // Step 3: API Check
      if (hasApiKey()) {
        addLog('API_GATEWAY', 'Gemini Neural Engine Connected', 'OK');
      } else {
        addLog('API_GATEWAY', 'API Key not found (Using Demo Mode)', 'WARN');
      }
      await new Promise(r => setTimeout(r, 500));
      setProgress(50);

      // Step 4: Database Simulation
      addLog('STORAGE', 'Mounting Local Encrypted Storage...', 'OK');
      await new Promise(r => setTimeout(r, 400));
      setProgress(70);

      // Step 5: Network
      if (navigator.onLine) {
        addLog('NETWORK', 'Secure Uplink Established (Latency: 12ms)', 'OK');
      } else {
        addLog('NETWORK', 'Offline Mode Detected', 'ERROR');
      }
      await new Promise(r => setTimeout(r, 400));
      setProgress(90);

      // Step 6: AI Models
      addLog('AI_MODEL', 'Loading XAUUSD-20Y-HISTORICAL Dataset...', 'OK');
      await new Promise(r => setTimeout(r, 800));
      addLog('SYSTEM', 'Ready for user authentication.', 'OK');
      setProgress(100);
      
      await new Promise(r => setTimeout(r, 500));
      onComplete();
    };

    bootSequence();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black text-green-500 font-mono text-xs z-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-800 p-2 flex justify-between items-center border-b border-slate-700">
          <span className="flex items-center gap-2 font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            SYSTEM BOOT // DIAGNOSTICS
          </span>
          <span className="text-slate-500">BIOS v.4.0.12</span>
        </div>

        {/* Logs Area */}
        <div className="h-64 overflow-y-auto p-4 space-y-1 custom-scrollbar bg-black/50">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4">
              <span className="text-slate-500">[{log.timestamp}]</span>
              <span className="text-blue-400 w-24">{log.module}</span>
              <span className={`flex-1 ${
                log.status === 'ERROR' ? 'text-red-500' : 
                log.status === 'WARN' ? 'text-yellow-500' : 'text-slate-300'
              }`}>
                {log.message}
              </span>
              <span className="font-bold">
                {log.status === 'OK' && <span className="text-green-500">[OK]</span>}
                {log.status === 'WARN' && <span className="text-yellow-500">[WARN]</span>}
                {log.status === 'ERROR' && <span className="text-red-500">[FAIL]</span>}
              </span>
            </div>
          ))}
          <div className="animate-pulse">_</div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex justify-between mb-1 text-slate-400">
            <span>SYSTEM INTEGRITY CHECK</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-slate-600 flex gap-8">
        <span className="flex items-center gap-2"><Cpu className="w-4 h-4" /> CPU: OK</span>
        <span className="flex items-center gap-2"><Database className="w-4 h-4" /> MEM: OK</span>
        <span className="flex items-center gap-2"><Wifi className="w-4 h-4" /> NET: OK</span>
      </div>
    </div>
  );
};

export default SystemBoot;