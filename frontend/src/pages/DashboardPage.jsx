import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Link2, MousePointerClick, CheckCircle2 } from 'lucide-react';
import { UrlForm } from '../components/UrlForm';
import { UrlTable } from '../components/UrlTable';
import { urlApi } from '../api/urlApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  show:    { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const StatCard = ({ icon: Icon, label, value, gradient, glow, delay, topBorder, cardBg }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className={`dark-card p-5 flex items-center gap-4 cursor-default border-t-2 overflow-hidden ${topBorder}`}
    style={cardBg}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0 ${gradient} ${glow}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <motion.p
        className="text-3xl font-black text-white mt-0.5"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.4, type: 'spring', stiffness: 200 }}
      >
        {value}
      </motion.p>
    </div>
  </motion.div>
);

export const DashboardPage = () => {
  const [urls, setUrls]               = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [file, setFile]               = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef                  = useRef(null);

  const { token, user } = useAuth();
  const { showToast }   = useToast();

  const fetchUrls = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await urlApi.getUrls(token);
      setUrls(data.urls ?? data);
    } catch {
      showToast('Failed to load URLs', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);
  useEffect(() => {
    const fn = () => { if (document.visibilityState === 'visible') fetchUrls(); };
    document.addEventListener('visibilitychange', fn);
    return () => document.removeEventListener('visibilitychange', fn);
  }, [fetchUrls]);

  const handleUrlCreated = (newUrl) => setUrls(prev => [newUrl, ...prev]);

  const handleDelete = async (id) => {
    try {
      await urlApi.deleteUrl(token, id);
      setUrls(prev => prev.filter(u => u.id !== id));
      showToast('URL deleted', 'success');
    } catch (err) {
      showToast(err, 'error');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) setFile(e.target.files[0]);
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    try {
      const result  = await urlApi.bulkCreateUrl(token, file);
      const created = result.createdUrls?.length ?? 0;
      const failed  = result.errors?.length ?? 0;
      showToast(
        failed > 0
          ? `Created ${created}, failed ${failed} row(s)`
          : `Imported ${created} URL(s)`,
        created === 0 ? 'error' : 'success'
      );
      setShowBulkModal(false);
      setFile(null);
      await fetchUrls();
    } catch (err) {
      showToast(err, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const totalClicks  = useMemo(() => urls.reduce((s, u) => s + (u.clickCount ?? 0), 0), [urls]);
  const activeLinks  = useMemo(() => urls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length, [urls]);

  return (
    <div className="min-h-screen bg-[#0b0d17] px-6 py-8 space-y-8">

      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="text-slate-300 text-sm font-medium">Welcome back, <span className="text-white font-semibold">{user?.name}</span></p>
        <Button size="sm" onClick={() => setShowBulkModal(true)} className="to-cyan-500 hover:to-cyan-400 shadow-violet-500/20">
          <Upload size={15} />
          Bulk Import CSV
        </Button>
      </motion.div>

      {/* Stats row */}
      {!isLoading && urls.length > 0 && (
        <motion.div
          className="grid grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <StatCard icon={Link2}             label="Total Links"  value={urls.length}  gradient="bg-gradient-to-br from-violet-600 to-violet-500" glow="glow-violet" delay={0.1} topBorder="border-violet-500"  cardBg={{ background: 'linear-gradient(135deg, #13162a 0%, #1c1042 100%)' }} />
          <StatCard icon={MousePointerClick} label="Total Clicks" value={totalClicks}  gradient="bg-gradient-to-br from-cyan-600 to-cyan-500"   glow="glow-cyan"   delay={0.2} topBorder="border-cyan-500"    cardBg={{ background: 'linear-gradient(135deg, #13162a 0%, #0d2030 100%)' }} />
          <StatCard icon={CheckCircle2}      label="Active Links" value={activeLinks}  gradient="bg-gradient-to-br from-emerald-600 to-emerald-500" glow="glow-green" delay={0.3} topBorder="border-emerald-500" cardBg={{ background: 'linear-gradient(135deg, #13162a 0%, #0c241a 100%)' }} />
        </motion.div>
      )}

      {/* Create form */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <UrlForm onUrlCreated={handleUrlCreated} />
      </motion.section>

      {/* Links table */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <h2 className="text-lg font-bold text-white mb-4">Your Links</h2>
        <UrlTable urls={urls} isLoading={isLoading} onDelete={handleDelete} onUpdate={fetchUrls} />
      </motion.section>

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="dark-card w-full max-w-md overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          >
            <div className="p-5 border-b border-white/[0.07] flex justify-between items-center">
              <h2 className="text-base font-bold text-white">Bulk Import via CSV</h2>
              <button
                onClick={() => { setShowBulkModal(false); setFile(null); }}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleBulkUpload} className="p-6 space-y-5">
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload a CSV with column <span className="text-violet-400 font-mono">originalUrl</span>,{' '}
                <span className="text-violet-400 font-mono">url</span>, or{' '}
                <span className="text-violet-400 font-mono">Destination</span>.
                Optional: <span className="text-violet-400 font-mono">customAlias</span>,{' '}
                <span className="text-violet-400 font-mono">expiresAt</span>.
              </p>
              <label className="block w-full border-2 border-dashed border-white/[0.1] rounded-xl p-8 text-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all group">
                <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                <Upload size={26} className="mx-auto text-slate-600 group-hover:text-violet-400 mb-3 transition-colors" />
                <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                  {file ? file.name : 'Click to select a .csv file'}
                </span>
              </label>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => { setShowBulkModal(false); setFile(null); }} disabled={isUploading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!file || isUploading}>
                  {isUploading ? 'Uploading…' : 'Import URLs'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};