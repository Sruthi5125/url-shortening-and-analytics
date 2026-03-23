import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { urlApi } from '../api/urlApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { ArrowLeft, Clock, Globe, Monitor, MousePointerClick, Calendar } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const AnalyticsPage = () => {
  const { id }    = useParams();
  const [data, setData]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { token }     = useAuth();
  const { showToast } = useToast();

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const d = await urlApi.getAnalytics(token, id);
      setData(d.analytics ?? d);
    } catch {
      showToast('Failed to load analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, token, showToast]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0d17] px-6 py-8 space-y-6">
        <div className="h-9 shimmer-skeleton rounded-xl w-48" />
        <div className="grid grid-cols-2 gap-5">
          <div className="h-36 shimmer-skeleton rounded-2xl" />
          <div className="h-36 shimmer-skeleton rounded-2xl" />
        </div>
        <div className="h-64 shimmer-skeleton rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0b0d17] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Analytics data not found.</p>
          <Link to="/dashboard" className="text-violet-400 hover:text-violet-300 underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const {
    totalClicks: clickCount,
    recentVisits,
    lastVisitedAt,
    expiresAt,
    browserBreakdown = [],
    deviceBreakdown  = [],
    dailyClicks      = [],
  } = data;
  const visits = recentVisits ?? [];

  return (
    <div className="min-h-screen bg-[#0b0d17] px-6 py-8 space-y-6">

      {/* Header */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/dashboard"
          className="p-2 dark-card text-slate-400 hover:text-white hover:border-white/20 transition-all rounded-xl"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold gradient-text tracking-tight">Link Analytics</h1>
          <p className="text-slate-300 text-sm mt-0.5">Deep insights for your short link</p>
        </div>
      </motion.div>

      {/* Top stat cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Total clicks */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="dark-card p-7 flex flex-col items-center justify-center text-center col-span-1 border-t-2 border-violet-500"
          style={{ background: 'linear-gradient(135deg, #13162a 0%, #1c1042 100%)' }}
        >
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-violet-500 rounded-2xl flex items-center justify-center mb-4 glow-violet shadow-lg">
            <MousePointerClick size={26} className="text-white" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Clicks</p>
          <motion.h2
            className="text-6xl font-black text-white"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            {clickCount}
          </motion.h2>
        </motion.div>

        {/* Status overview */}
        <motion.div
          variants={cardVariants}
          className="dark-card p-7 col-span-1 md:col-span-2 flex flex-col justify-center space-y-5 border-t-2 border-cyan-500"
          style={{ background: 'linear-gradient(135deg, #13162a 0%, #0d2030 100%)' }}
        >
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Status Overview</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="p-3 bg-cyan-500/15 rounded-xl text-cyan-400 shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Last Visited</p>
                <p className="text-base font-bold text-white">
                  {lastVisitedAt ? formatDate(lastVisitedAt) : 'Never visited'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="p-3 bg-violet-500/15 rounded-xl text-violet-400 shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Expires</p>
                <p className="text-base font-bold text-white">
                  {expiresAt ? formatDate(expiresAt) : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Distribution cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Device */}
        <motion.div variants={cardVariants} className="dark-card p-6 border-t-2 border-violet-500" style={{ background: 'linear-gradient(135deg, #13162a 0%, #1c1042 100%)' }}>
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-violet-500/20 text-violet-400 rounded-lg"><Monitor size={16} /></div>
            Device Distribution
          </h2>
          {deviceBreakdown.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-white/[0.07] rounded-xl text-slate-400 text-sm">No device data yet.</div>
          ) : (
            <div className="space-y-4">
              {deviceBreakdown.map((item, i) => {
                const total   = deviceBreakdown.reduce((a, c) => a + c.count, 0);
                const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-200">{item.device}</span>
                      <span className="text-slate-400">{item.count} <span className="text-slate-400 text-xs">({percent}%)</span></span>
                    </div>
                    <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-violet-500 to-violet-400 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Browser */}
        <motion.div variants={cardVariants} className="dark-card p-6 border-t-2 border-cyan-500" style={{ background: 'linear-gradient(135deg, #13162a 0%, #0d2030 100%)' }}>
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg"><Globe size={16} /></div>
            Browser Distribution
          </h2>
          {browserBreakdown.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-white/[0.07] rounded-xl text-slate-400 text-sm">No browser data yet.</div>
          ) : (
            <div className="space-y-4">
              {browserBreakdown.map((item, i) => {
                const total   = browserBreakdown.reduce((a, c) => a + c.count, 0);
                const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-200">{item.browser}</span>
                      <span className="text-slate-400">{item.count} <span className="text-slate-400 text-xs">({percent}%)</span></span>
                    </div>
                    <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Engagement chart */}
      <motion.div
        className="dark-card p-6 border-t-2 border-emerald-500"
        style={{ background: 'linear-gradient(135deg, #13162a 0%, #0c241a 100%)' }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg"><Calendar size={16} /></div>
          Engagement Over Time
        </h2>
        {dailyClicks.length === 0 ? (
          <div className="text-center text-slate-400 py-14 border border-dashed border-white/[0.07] rounded-xl text-sm">No click data yet</div>
        ) : (
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyClicks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tickFormatter={(t, i) => { const iv = dailyClicks.length <= 7 ? 1 : dailyClicks.length <= 14 ? 2 : 5; return i % iv === 0 ? t.substring(5) : ''; }} stroke="#334155" fontSize={11} tickLine={false} axisLine={false} dy={10} tick={{ fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} stroke="#334155" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#13162a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '12px' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Visit log */}
      <motion.div
        className="dark-card overflow-hidden border-t-2 border-violet-500/60"
        style={{ background: 'linear-gradient(160deg, #13162a 0%, #1a1040 50%, #0d2030 100%)' }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        <div className="p-6 border-b border-white/[0.07]">
          <h2 className="text-base font-bold text-white">Visit Log</h2>
          <p className="text-sm text-slate-300 mt-1">Detailed history of recent interactions</p>
        </div>
        {visits.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No visits recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Browser</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">OS / Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {visits.slice(0, 10).map((visit) => (
                  <tr key={visit.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-violet-500 shrink-0" />
                        {new Date(visit.visitedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] text-slate-300 font-mono text-xs">
                        <Globe size={11} className="text-cyan-500" />
                        {visit.ipAddress || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 text-xs font-medium">
                        <Monitor size={11} />
                        {visit.browser || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {visit.os || visit.deviceType || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};