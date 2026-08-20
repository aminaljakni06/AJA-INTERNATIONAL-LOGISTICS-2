import React, { useState } from 'react';
import {
  Activity,
  Clock,
  User,
  Monitor,
  Globe,
  Briefcase,
  Bell,
  Cpu,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { ActivityRecord, UserSessionRecord } from '../../types/audit';

interface ActivityTimelineViewerProps {
  activityLogs: ActivityRecord[];
  activeSessions: UserSessionRecord[];
}

export const ActivityTimelineViewer: React.FC<ActivityTimelineViewerProps> = ({
  activityLogs,
  activeSessions,
}) => {
  const [activeTab, setActiveTab] = useState<'ACTIVITIES' | 'SESSIONS'>('ACTIVITIES');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'USER':
        return <User className="w-4 h-4 text-emerald-400" />;
      case 'WORKFLOW':
        return <Layers className="w-4 h-4 text-blue-400" />;
      case 'BACKGROUND_JOB':
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'NOTIFICATION':
        return <Bell className="w-4 h-4 text-amber-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6 text-slate-100">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Activity Log & Live Sessions</h3>
            <p className="text-xs text-slate-400">Enterprise operational timeline and active user sessions</p>
          </div>
        </div>

        <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('ACTIVITIES')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'ACTIVITIES' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Activity Stream ({activityLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('SESSIONS')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'SESSIONS' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Sessions ({activeSessions.length})
          </button>
        </div>
      </div>

      {activeTab === 'ACTIVITIES' ? (
        <div className="space-y-4">
          {activityLogs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No activity events recorded yet.</p>
          ) : (
            <div className="relative border-l-2 border-slate-800 mr-4 space-y-6 pr-6">
              {activityLogs.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -right-[23px] top-1.5 p-1.5 bg-slate-900 border border-slate-700 rounded-full">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 space-y-1.5 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{item.title}</span>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center">
                        <Clock className="w-3 h-3 ml-1" />
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {item.details && <p className="text-xs text-slate-400">{item.details}</p>}

                    <div className="flex items-center space-x-3 space-x-reverse text-[10px] text-slate-500 pt-1">
                      <span className="flex items-center">
                        <User className="w-3 h-3 ml-1 text-slate-400" />
                        {item.userName || item.userId}
                      </span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        {item.module}
                      </span>
                      <span>•</span>
                      <span className="text-blue-400">{item.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSessions.map((session) => (
            <div key={session.id} className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-xs text-white">{session.userName || session.userId}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active Now
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex items-center">
                  <Monitor className="w-3.5 h-3.5 ml-2 text-slate-500" />
                  <span>
                    {session.device} • {session.browser} ({session.os})
                  </span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-3.5 h-3.5 ml-2 text-slate-500" />
                  <span>
                    {session.ipAddress} • {session.country}
                  </span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-3.5 h-3.5 ml-2 text-slate-500" />
                  <span>
                    Branch: {session.branchId || 'Headquarters'} ({session.companyId})
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                Logged in at: {new Date(session.loginTimestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
