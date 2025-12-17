import React, { useState } from 'react';
import { X, Save, Key, Globe, Bell, ToggleLeft, ToggleRight, Server } from 'lucide-react';
import { AppSettings } from '../types';
import { setApiKey, hasApiKey } from '../services/geminiService';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    emailAlerts: false,
    autoRisk: true,
    theme: 'dark',
    apiKey: '' // Masked in UI
  });

  const [saving, setSaving] = useState(false);
  const isKeySet = hasApiKey();

  const handleSave = () => {
    setSaving(true);
    
    if (settings.apiKey) {
      // Clean the key before saving
      setApiKey(settings.apiKey.trim());
    }
    
    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-2xl rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-gold-500" />
            System Configuration
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section 1: API Integrations */}
          <div>
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 border-b border-blue-900/30 pb-2">
              API Integrations
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <Key className="w-4 h-4 text-gold-500" />
                  <label className="text-sm font-semibold text-white">Google Gemini API Key (AI Engine)</label>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    placeholder={isKeySet ? "•••••••••••••••• (Configured)" : "Paste AIza... Key Here"}
                    value={settings.apiKey}
                    onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs font-mono text-white focus:border-gold-500 outline-none placeholder:text-slate-600"
                  />
                  <div className={`px-3 py-2 text-xs rounded border flex items-center ${
                      isKeySet 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {isKeySet ? 'Active' : 'Missing'}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Required for ICT Analysis and Fundamental News scanning.</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800 opacity-70">
                 <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <div>
                        <p className="text-sm font-semibold text-slate-300">NewsAPI / Bloomberg Feed</p>
                        <p className="text-[10px] text-slate-500">Real-time economic calendar & news wires</p>
                    </div>
                 </div>
                 <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">Managed via AI Tools</span>
              </div>
            </div>
          </div>

          {/* Section 2: Alerts & Notifications */}
          <div>
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 border-b border-blue-900/30 pb-2">
              Alerts & Notifications
            </h3>
            <div className="space-y-3">
               <div className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded transition">
                  <div className="flex items-center gap-3">
                     <Bell className="w-4 h-4 text-slate-400" />
                     <span className="text-sm text-slate-300">Browser Notifications</span>
                  </div>
                  <button onClick={() => setSettings({...settings, notifications: !settings.notifications})}>
                     {settings.notifications ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                  </button>
               </div>
               
               <div className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded transition">
                  <div className="flex items-center gap-3">
                     <Server className="w-4 h-4 text-slate-400" />
                     <span className="text-sm text-slate-300">Email Alerts (Twilio/SendGrid)</span>
                  </div>
                  <button onClick={() => setSettings({...settings, emailAlerts: !settings.emailAlerts})}>
                     {settings.emailAlerts ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                  </button>
               </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
           <button onClick={onClose} className="px-4 py-2 rounded text-slate-400 hover:text-white text-xs font-bold">CANCEL</button>
           <button 
             onClick={handleSave}
             disabled={saving}
             className="px-6 py-2 bg-gold-500 hover:bg-gold-400 text-black rounded font-bold text-xs flex items-center gap-2 transition"
           >
             {saving ? 'VERIFYING...' : (
                <>
                <Save className="w-4 h-4" />
                SAVE CONFIGURATION
                </>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
