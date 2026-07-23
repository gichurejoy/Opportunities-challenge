/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NudgeConfig, NudgeSchedule } from '../types';
import { 
  Bell, 
  BellRing, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Clock, 
  Sparkles, 
  History, 
  Play, 
  Check, 
  AlertCircle,
  HelpCircle,
  Smartphone
} from 'lucide-react';

interface NudgeSettingsProps {
  nudgeConfig: NudgeConfig;
  onUpdateNudgeConfig: (config: NudgeConfig) => void;
  onTriggerTestNudge: (customMessage?: string) => void;
}

const PRESET_MESSAGES = [
  "What's one more opportunity you can create today?",
  "Consistent action breeds momentum. What effort can you register now?",
  "A small step today, a giant leap tomorrow. Log one breakthrough!",
  "Create a breakthrough now! What phone call, email, or task can you do?",
  "Your 1000 opportunities roadmap is waiting. Set one action live!"
];

export const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Ding 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Ding 2 (High bright chime harmonic)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.1); // E6
    gain2.gain.setValueAtTime(0.0, ctx.currentTime);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    console.warn('AudioContext not supported or blocked by browser policy', e);
  }
};

export const NudgeSettings: React.FC<NudgeSettingsProps> = ({
  nudgeConfig,
  onUpdateNudgeConfig,
  onTriggerTestNudge,
}) => {
  const [newTime, setNewTime] = useState<string>('12:00');
  const [selectedPresetMessage, setSelectedPresetMessage] = useState<string>(PRESET_MESSAGES[0]);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [activeTab, setActiveTab] = useState<'schedules' | 'history'>('schedules');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support native desktop push notifications. Falling back to high-fidelity In-App Toast alerts.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        onUpdateNudgeConfig({
          ...nudgeConfig,
          browserNotificationsEnabled: true
        });
        // Play success tone
        playNotificationChime();
        new Notification("Momentum Nudges Enabled", {
          body: "What's one more opportunity you can create today?",
          icon: '/favicon.ico'
        });
      } else {
        onUpdateNudgeConfig({
          ...nudgeConfig,
          browserNotificationsEnabled: false
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission', error);
    }
  };

  const handleToggleNudges = (enabled: boolean) => {
    onUpdateNudgeConfig({
      ...nudgeConfig,
      enabled
    });
  };

  const handleToggleSound = (soundEnabled: boolean) => {
    onUpdateNudgeConfig({
      ...nudgeConfig,
      soundEnabled
    });
    if (soundEnabled) {
      playNotificationChime();
    }
  };

  const handleToggleBrowserNotifications = (val: boolean) => {
    if (val && permissionStatus !== 'granted') {
      handleRequestPermission();
    } else {
      onUpdateNudgeConfig({
        ...nudgeConfig,
        browserNotificationsEnabled: val
      });
    }
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMessage = customMessage.trim() || selectedPresetMessage;
    
    // Check if time already exists
    if (nudgeConfig.schedules.some((s) => s.time === newTime)) {
      alert('A nudge schedule is already set for this time!');
      return;
    }

    const newSchedule: NudgeSchedule = {
      id: `nudge-${Date.now()}`,
      time: newTime,
      enabled: true,
      message: finalMessage
    };

    const updatedSchedules = [...nudgeConfig.schedules, newSchedule].sort((a, b) => a.time.localeCompare(b.time));
    onUpdateNudgeConfig({
      ...nudgeConfig,
      schedules: updatedSchedules
    });

    setCustomMessage('');
  };

  const handleDeleteSchedule = (id: string) => {
    const updatedSchedules = nudgeConfig.schedules.filter((s) => s.id !== id);
    onUpdateNudgeConfig({
      ...nudgeConfig,
      schedules: updatedSchedules
    });
  };

  const handleToggleSchedule = (id: string) => {
    const updatedSchedules = nudgeConfig.schedules.map((s) => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    onUpdateNudgeConfig({
      ...nudgeConfig,
      schedules: updatedSchedules
    });
  };

  const handleTestTrigger = () => {
    const activeMsg = customMessage.trim() || selectedPresetMessage;
    if (nudgeConfig.soundEnabled) {
      playNotificationChime();
    }
    onTriggerTestNudge(activeMsg);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all notification trigger history logs?')) {
      onUpdateNudgeConfig({
        ...nudgeConfig,
        history: []
      });
    }
  };

  return (
    <div id="nudge-settings-panel" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col h-full justify-between transition-all duration-300">
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-serif font-black text-sepia-900 dark:text-cream-100 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-readflow-gold" />
            Momentum Nudges Config
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              id="btn-test-nudge-preview"
              type="button"
              onClick={handleTestTrigger}
              className="text-xs font-bold text-readflow-green hover:text-white hover:bg-readflow-green bg-cream-50 dark:bg-sepia-800 px-3 py-1.5 rounded-lg border border-cream-200 dark:border-sepia-750 flex items-center gap-1 cursor-pointer transition-all"
              title="Test dynamic sound and visual nudge alert instantly"
            >
              <Play className="w-3.5 h-3.5" />
              Test Nudge
            </button>
          </div>
        </div>

        <p className="text-xs text-sepia-450 dark:text-sepia-500 mb-5 font-sans font-medium leading-relaxed">
          Configure timed alerts to push your daily action potential. Whenever a schedule fires, a persistent micro-prompt keeps you accountable to the 1,000 opportunities objective.
        </p>

        {/* Global Control Switches */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-xl border border-cream-150 dark:border-sepia-850 bg-cream-50/20 dark:bg-sepia-850/5 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-sepia-400 dark:text-sepia-550 uppercase tracking-wide block">System Nudges</span>
              <span className="text-xs font-bold text-sepia-800 dark:text-cream-100">{nudgeConfig.enabled ? 'Active' : 'Disabled'}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={nudgeConfig.enabled}
                onChange={(e) => handleToggleNudges(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-cream-200 dark:bg-sepia-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-readflow-green" />
            </label>
          </div>

          <div className="p-3 rounded-xl border border-cream-150 dark:border-sepia-850 bg-cream-50/20 dark:bg-sepia-850/5 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-sepia-400 dark:text-sepia-550 uppercase tracking-wide block">Auditory Chime</span>
              <span className="text-xs font-bold text-sepia-800 dark:text-cream-100 flex items-center gap-1">
                {nudgeConfig.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-readflow-green" /> : <VolumeX className="w-3.5 h-3.5 text-sepia-400" />}
                {nudgeConfig.soundEnabled ? 'Synthesizer On' : 'Silent Mode'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={nudgeConfig.soundEnabled}
                onChange={(e) => handleToggleSound(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-cream-200 dark:bg-sepia-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-readflow-green" />
            </label>
          </div>

          <div className="p-3 rounded-xl border border-cream-150 dark:border-sepia-850 bg-cream-50/20 dark:bg-sepia-850/5 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-sepia-400 dark:text-sepia-550 uppercase tracking-wide block">Browser Push API</span>
              <span className="text-[11px] font-bold text-sepia-800 dark:text-cream-100 truncate flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-sepia-400" />
                {permissionStatus === 'granted' && nudgeConfig.browserNotificationsEnabled ? 'Push Engaged' : 'In-App Alert'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={nudgeConfig.browserNotificationsEnabled && permissionStatus === 'granted'}
                onChange={(e) => handleToggleBrowserNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-cream-200 dark:bg-sepia-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-readflow-green" />
            </label>
          </div>
        </div>

        {/* Permission Assistance Banner */}
        {permissionStatus !== 'granted' && (
          <div className="mb-5 p-2.5 rounded-lg bg-cream-50/60 dark:bg-sepia-850/20 border border-cream-150 dark:border-sepia-850/40 text-[10px] flex items-start gap-2 text-sepia-700 dark:text-cream-200">
            <AlertCircle className="w-4 h-4 text-readflow-gold shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">
              <strong>Push Permission:</strong> Click <button onClick={handleRequestPermission} className="underline text-readflow-green dark:text-readflow-lightgreen font-bold hover:text-readflow-olive transition-all cursor-pointer">Engage Push API</button> to allow true background desktop alerts. If denied or inside restricted browser iframes, we automatically trigger a fallback <strong>visual chime widget</strong> in real-time.
            </p>
          </div>
        )}

        {/* Toggle between Schedules configuration and History logs */}
        <div className="flex border-b border-cream-150 dark:border-sepia-850 mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex-1 pb-2 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'schedules'
                ? 'border-readflow-green text-sepia-800 dark:text-cream-50 font-bold'
                : 'border-transparent text-sepia-400 dark:text-sepia-500 hover:text-sepia-650'
            }`}
          >
            Schedules ({nudgeConfig.schedules.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 pb-2 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-readflow-green text-sepia-800 dark:text-cream-50 font-bold'
                : 'border-transparent text-sepia-400 dark:text-sepia-500 hover:text-sepia-650'
            }`}
          >
            Alert History ({nudgeConfig.history.length})
          </button>
        </div>

        {/* Content Tabs */}
        {activeTab === 'schedules' ? (
          <div className="space-y-4">
            {/* List of current schedules */}
            <div className="max-h-[160px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
              {nudgeConfig.schedules.length === 0 ? (
                <p className="text-xs text-sepia-400 italic text-center py-6">No scheduled nudges. Add one below to kickstart your tracking!</p>
              ) : (
                nudgeConfig.schedules.map((schedule) => (
                  <div 
                    key={schedule.id} 
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
                      schedule.enabled 
                        ? 'bg-cream-50/50 dark:bg-sepia-850/10 border-cream-200 dark:border-sepia-850' 
                        : 'bg-cream-50/10 dark:bg-sepia-900/10 border-cream-100 dark:border-sepia-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-sepia-900 px-2 py-1 rounded-lg border border-cream-200 dark:border-sepia-750 text-sepia-800 dark:text-cream-100 font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-readflow-gold" />
                        <span>{schedule.time}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-sepia-750 dark:text-cream-150 truncate leading-tight pr-2">
                          {schedule.message}
                        </p>
                        <span className="text-[9px] text-sepia-400 dark:text-sepia-550 font-semibold uppercase tracking-wider block mt-0.5">Daily reminder</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={schedule.enabled}
                          onChange={() => handleToggleSchedule(schedule.id)}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 bg-cream-200 dark:bg-sepia-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-readflow-green" />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="text-sepia-400 hover:text-red-500 p-1 transition-all cursor-pointer"
                        title="Delete schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Create Schedule Form */}
            <form onSubmit={handleAddSchedule} className="border-t border-cream-150/60 dark:border-sepia-850/60 pt-4 space-y-3">
              <span className="text-[10px] font-bold text-sepia-400 dark:text-sepia-500 uppercase tracking-wider block">
                Append New Momentum Nudge
              </span>
              <div className="flex flex-col gap-2.5">
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-cream-50 dark:bg-sepia-850 border border-cream-200 dark:border-sepia-800 px-3 py-2 rounded-xl">
                    <Clock className="w-4 h-4 text-readflow-gold shrink-0" />
                    <input
                      id="nudge-time-input"
                      type="time"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="bg-transparent text-xs font-mono font-bold text-sepia-800 dark:text-cream-100 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <select
                      id="preset-nudge-message-select"
                      value={selectedPresetMessage}
                      onChange={(e) => {
                        setSelectedPresetMessage(e.target.value);
                        setCustomMessage('');
                      }}
                      className="w-full px-3 py-2 bg-cream-50 dark:bg-sepia-850 border border-cream-200 dark:border-sepia-800 rounded-xl text-xs font-bold text-sepia-800 dark:text-cream-100 focus:outline-none"
                    >
                      {PRESET_MESSAGES.map((msg, idx) => (
                        <option key={idx} value={msg}>{msg.length > 50 ? `${msg.slice(0, 48)}...` : msg}</option>
                      ))}
                      <option value="custom">✏️ Compose Custom Message...</option>
                    </select>
                  </div>
                </div>

                {(selectedPresetMessage === 'custom' || customMessage !== '') && (
                  <input
                    id="custom-nudge-msg-input"
                    type="text"
                    placeholder="Type your custom nudge question here..."
                    required
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none placeholder-sepia-400"
                  />
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-readflow-green hover:bg-readflow-olive text-cream-100 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Schedule Nudge
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* History logs view */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-sepia-400 dark:text-sepia-550 uppercase tracking-wider">
                Historical Trigger Audit
              </span>
              {nudgeConfig.history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear History
                </button>
              )}
            </div>

            <div className="max-h-[220px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
              {nudgeConfig.history.length === 0 ? (
                <div className="text-center py-10">
                  <History className="w-8 h-8 text-cream-200 dark:text-sepia-800 mx-auto mb-2" />
                  <p className="text-xs text-sepia-400 italic">No historical nudge logs found yet.</p>
                </div>
              ) : (
                [...nudgeConfig.history].reverse().map((log) => (
                  <div 
                    key={log.id} 
                    className="p-2.5 rounded-xl bg-cream-50/50 dark:bg-sepia-850/15 border border-cream-150 dark:border-sepia-850 flex items-start gap-2.5 text-xs font-sans font-medium"
                  >
                    <div className="mt-0.5">
                      {log.actionTaken ? (
                        <div className="w-4 h-4 rounded-full bg-readflow-green/10 text-readflow-green flex items-center justify-center font-bold" title="Action Completed">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-cream-150 dark:bg-sepia-800 text-sepia-400 flex items-center justify-center font-mono text-[9px] font-bold" title="Alert Delivered">
                          ●
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-sepia-800 dark:text-cream-100 font-semibold line-clamp-2 leading-snug">
                        "{log.message}"
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono font-bold text-sepia-400 dark:text-sepia-550">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        <span className="text-[9px] font-mono font-bold">
                          {log.actionTaken ? (
                            <span className="text-readflow-green bg-readflow-green/5 px-1 rounded">Action Taken</span>
                          ) : (
                            <span className="text-sepia-400 bg-cream-100 dark:bg-sepia-800 px-1 rounded">No Action</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Footnote */}
      <div className="mt-4 text-[10px] text-sepia-450 dark:text-sepia-500 text-center flex items-center justify-center gap-1.5 border-t border-cream-150 dark:border-sepia-800 pt-3">
        <Sparkles className="w-3.5 h-3.5 text-readflow-gold shrink-0" />
        Schedules execute in local browser time to nudge incremental action.
      </div>
    </div>
  );
};
