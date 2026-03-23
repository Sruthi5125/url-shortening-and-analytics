import { useState } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { urlApi } from '../api/urlApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { Link2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const UrlForm = ({ onUrlCreated }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt,   setExpiresAt]   = useState(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState('');

  const { token }     = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try { new URL(originalUrl); }
    catch { setError('Please enter a valid URL (including http:// or https://)'); return; }
    if (customAlias && !/^[a-zA-Z0-9-_]{3,30}$/.test(customAlias)) {
      setError('Custom alias must be 3–30 chars (alphanumeric, hyphens, underscores)');
      return;
    }
    setIsLoading(true);
    try {
      const data = await urlApi.createUrl(token, originalUrl, customAlias || undefined, expiresAt ? expiresAt.toISOString() : undefined);
      showToast('Short URL created!', 'success');
      setOriginalUrl(''); setCustomAlias(''); setExpiresAt(null);
      if (onUrlCreated) onUrlCreated(data.url);
    } catch (err) {
      setError(err);
      showToast(err, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="dark-card p-6 border-t-2 border-violet-500/60"
      style={{ background: 'linear-gradient(135deg, #13162a 0%, #1a1040 100%)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
          <Link2 size={16} className="text-white stroke-[2.5]" />
        </div>
        <h2 className="text-lg font-bold text-white">Create New Short Link</h2>
      </div>

      {error && (
        <motion.div
          className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 space-y-1.5">
            <label htmlFor="originalUrl" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Long URL <span className="text-red-400 normal-case font-bold">*</span>
            </label>
            <Input
              id="originalUrl"
              type="text"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/very-long-url"
              required
            />
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <label htmlFor="customAlias" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Custom Alias <span className="text-slate-400 normal-case font-normal">(optional)</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center h-10 px-3 rounded-l-xl border border-r-0 border-white/[0.1] bg-white/[0.04] text-slate-500 text-sm font-mono shrink-0">
                /r/
              </span>
              <Input
                id="customAlias"
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                placeholder="my-link"
                className="rounded-l-none border-l-0"
              />
            </div>
          </div>

          <div className="md:col-span-12 space-y-1.5">
            <label htmlFor="expiresAt" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Expiry Date <span className="text-slate-400 normal-case font-normal">(optional)</span>
            </label>
            <DatePicker
              id="expiresAt"
              selected={expiresAt}
              onChange={(date) => setExpiresAt(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd MMM yyyy, HH:mm"
              placeholderText="Select expiry date & time"
              minDate={new Date()}
              showDisabledMonthNavigation
              popperClassName="dark-datepicker-popper"
              customInput={
                <Input readOnly className="cursor-pointer" />
              }
            />
          </div>
        </div>

        <div className="pt-1">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
            ) : (
              'Shorten URL'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};