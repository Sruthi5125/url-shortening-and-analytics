import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Calendar, MousePointerClick, Activity, Clock, Monitor, Globe } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const PublicStatsPage = () => {
  const { shortCode }           = useParams();
  const [stats, setStats]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res  = await fetch(`${API_BASE_URL}/api/public/${shortCode}/stats`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [shortCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0d17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 shimmer-skeleton" />
          <div className="h-5 w-32 shimmer-skeleton rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-[#0b0d17] flex items-center justify-center p-4">
        <div className="dark-card p-10 max-w-md w-full text-center">
          <div className="mx-auto w-14 h-14 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-5">
            <X size={22} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Stats Not Found</h2>
          <p className="text-slate-500 mb-6 text-sm">{error || "This link's statistics are not available."}</p>
          <Link to="/" className="text-violet-400 hover:text-violet-300 font-medium text-sm">Return to Home</Link>
        </div>
      </div>
    );
  }

  const { browserBreakdown = [], deviceBreakdown = [], dailyClicks = [] } = stats;

  const statCards = [
    { icon: MousePointerClick, label: 'Total Clicks',  value: stats.clickCount,      gradient: 'from-violet-600 to-violet-500', glow: 'glow-violet' },
    { icon: Activity,          label: 'Last 7 Days',   value: stats.last7DaysClicks, gradient: 'from-cyan-600 to-cyan-500',     glow: 'glow-cyan'   },
    { icon: Calendar,          label: 'Created On',    value: formatDate(stats.createdAt),           gradient: 'from-emerald-600 to-emerald-500', glow: 'glow-green', small: true },
    { icon: Clock,             label: 'Last Visited',  value: stats.lastVisitedAt ? formatDate(stats.lastVisitedAt) : 'Never', gradient: 'from-pink-600 to-pink-500', glow: 'glow-pink', small: true },
  ];

  return (
    <div className="min-h-screen bg-[#0b0d17] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-extrabold gradient-text tracking-tight">Public Statistics</h1>
          <p className="mt-3 text-slate-500 text-base">
            Stats for short link:{' '}
            <span className="font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg font-mono text-sm">
              /{stats.shortCode}
            </span>
          </p>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {statCards.map(({ icon: Icon, label, value, gradient, glow, small }) => (
            <motion.div
              key={label}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className={`dark-card p-5 flex flex-col items-center text-center border-t-2 ${
                glow === 'glow-violet' ? 'border-violet-500' :
                glow === 'glow-cyan'   ? 'border-cyan-500'   :
                glow === 'glow-green'  ? 'border-emerald-500' :
                'border-pink-500'
              }`}
              style={{
                background:
                  glow === 'glow-violet' ? 'linear-gradient(135deg, #13162a 0%, #1c1042 100%)' :
                  glow === 'glow-cyan'   ? 'linear-gradient(135deg, #13162a 0%, #0d2030 100%)' :
                  glow === 'glow-green'  ? 'linear-gradient(135deg, #13162a 0%, #0c241a 100%)' :
                  'linear-gradient(135deg, #13162a 0%, #2a0d20 100%)',
              }}
            >
              <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg ${glow}`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">{label}</p>
              <h2 className={`font-extrabold text-white ${small ? 'text-sm mt-1' : 'text-3xl'}`}>{value}</h2>
            </motion.div>
          ))}
        </motion.div>

        {/* Link status */}
        <motion.div
          className="dark-card p-6 text-center border-t-2 border-violet-500/60"
          style={{ background: 'linear-gradient(135deg, #13162a 0%, #1a1040 50%, #0d2030 100%)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-widest">Link Status</h3>
          {stats.isActive ? (
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active & Working
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-red-500/15 text-red-400 border border-red-500/25">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Expired
            </span>
          )}
        </motion.div>

        {/* Chart */}
        <motion.div
          className="dark-card p-6 border-t-2 border-cyan-500"
          style={{ background: 'linear-gradient(135deg, #13162a 0%, #0d2030 100%)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg"><Activity size={16} /></div>
            Clicks Over Time (Last 30 Days)
          </h3>
          {dailyClicks.length === 0 ? (
            <div className="text-center text-slate-400 py-12 border border-dashed border-white/[0.07] rounded-xl text-sm">No click data yet</div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyClicks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tickFormatter={(t, i) => { const iv = dailyClicks.length <= 7 ? 1 : dailyClicks.length <= 14 ? 2 : 5; return i % iv === 0 ? t.substring(5) : ''; }} stroke="#334155" fontSize={11} tickLine={false} axisLine={false} dy={10} tick={{ fill: '#94a3b8' }} />
                  <YAxis allowDecimals={false} stroke="#334155" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#13162a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }} labelStyle={{ color: '#94a3b8', fontSize: '12px' }} itemStyle={{ color: '#22d3ee' }} />
                  <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClicks)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Distribution */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } } }}
        >
          {[
            { title: 'Device Distribution', data: deviceBreakdown, key: 'device', gradient: 'from-violet-500 to-violet-400', icon: Monitor, color: 'violet' },
            { title: 'Browser Distribution', data: browserBreakdown, key: 'browser', gradient: 'from-cyan-500 to-cyan-400', icon: Globe, color: 'cyan' },
          ].map(({ title, data: bData, key, gradient, icon: Icon, color }) => (
            <motion.div
              key={title}
              variants={cardVariants}
              className={`dark-card p-6 border-t-2 ${color === 'violet' ? 'border-violet-500' : 'border-cyan-500'}`}
              style={{ background: color === 'violet' ? 'linear-gradient(135deg, #13162a 0%, #1c1042 100%)' : 'linear-gradient(135deg, #13162a 0%, #0d2030 100%)' }}
            >
              <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                <div className={`p-1.5 bg-${color}-500/20 text-${color}-400 rounded-lg`}><Icon size={16} /></div>
                {title}
              </h3>
              {bData.length === 0 ? (
                <div className="text-center text-slate-400 py-8 border border-dashed border-white/[0.07] rounded-xl text-sm">No data yet</div>
              ) : (
                <div className="space-y-4">
                  {bData.map((item, i) => {
                    const total   = bData.reduce((a, c) => a + c.count, 0);
                    const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-semibold text-slate-200">{item[key]}</span>
                          <span className="text-slate-400">{item.count} <span className="text-slate-400 text-xs">({percent}%)</span></span>
                        </div>
                        <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
                          <motion.div
                            className={`bg-gradient-to-r ${gradient} h-2 rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};