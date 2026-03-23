import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Trash2, ExternalLink, MousePointerClick, QrCode, X, Download, Pencil, Check, Share2 } from 'lucide-react';
import { CopyButton } from './CopyButton';
import { formatDate } from '../utils/formatDate';
import { urlApi } from '../api/urlApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const UrlTable = ({ urls, isLoading, onDelete, onUpdate }) => {
  const { token }     = useAuth();
  const { showToast } = useToast();
  const [qrModal,       setQrModal]       = useState({ isOpen: false, url: null, qrCodeDataUrl: null, isLoading: false, error: null });
  const [editingUrlId,  setEditingUrlId]  = useState(null);
  const [editInputValue, setEditInputValue] = useState('');
  const [isSaving,      setIsSaving]      = useState({});

  const handleEditClick  = (url) => { setEditingUrlId(url.id); setEditInputValue(url.originalUrl); };
  const handleCancelEdit = ()    => { setEditingUrlId(null); setEditInputValue(''); };

  const handleSaveEdit = async (urlId) => {
    setIsSaving(p => ({ ...p, [urlId]: true }));
    try {
      await urlApi.updateUrl(token, urlId, editInputValue);
      showToast('URL updated', 'success');
      setEditingUrlId(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      showToast(err, 'error');
    } finally {
      setIsSaving(p => ({ ...p, [urlId]: false }));
    }
  };

  const handleOpenQr = async (url) => {
    setQrModal({ isOpen: true, url, qrCodeDataUrl: null, isLoading: true, error: null });
    try {
      const data = await urlApi.getQrCode(token, url.id);
      setQrModal(p => ({ ...p, qrCodeDataUrl: data.qrCode, isLoading: false }));
    } catch (err) {
      setQrModal(p => ({ ...p, error: err, isLoading: false }));
    }
  };

  const handleCloseQr = () =>
    setQrModal({ isOpen: false, url: null, qrCodeDataUrl: null, isLoading: false, error: null });

  const renderExpiryBadge = (expiresAt) => {
    if (!expiresAt) return <span className="text-slate-300">Never</span>;
    const diff = (new Date(expiresAt) - new Date()) / 86400000;
    if (diff < 0)  return <Badge variant="danger">Expired</Badge>;
    if (diff <= 3) return <Badge variant="warning">Expires soon</Badge>;
    return <span className="text-slate-400 text-xs">{formatDate(expiresAt)}</span>;
  };

  const ActionBtn = ({ onClick, title, children, danger }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-all duration-150 ${
        danger
          ? 'text-slate-300 hover:text-red-400 hover:bg-red-500/10'
          : 'text-slate-300 hover:text-violet-400 hover:bg-violet-500/10'
      }`}
    >
      {children}
    </button>
  );

  if (isLoading) {
    return (
      <div className="dark-card p-5 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 shimmer-skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="dark-card p-14 text-center">
        <div className="mx-auto w-14 h-14 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-4">
          <MousePointerClick className="h-6 w-6 text-violet-500" />
        </div>
        <h3 className="text-base font-semibold text-white mb-2">No short URLs yet</h3>
        <p className="text-slate-500 text-sm">Use the form above to create your first short link.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile */}
      <div className="block md:hidden dark-card overflow-hidden border-t-2 border-violet-500/50" style={{ background: 'linear-gradient(160deg, #13162a 0%, #1a1040 50%, #0d2030 100%)' }}>
        <ul className="divide-y divide-white/[0.05]">
          {urls.map((url) => (
            <li key={url.id} className="p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <a href={url.shortUrl} target="_blank" rel="noopener noreferrer"
                  className="text-violet-400 font-medium flex items-center gap-1 hover:text-violet-300 transition-colors text-sm truncate">
                  {url.shortUrl.replace(/^https?:\/\//, '')}
                  <ExternalLink size={12} />
                </a>
                <CopyButton text={url.shortUrl} onCopy={() => showToast('Copied!', 'success')} />
              </div>
              {editingUrlId === url.id ? (
                <div className="flex items-center gap-2 mb-3">
                  <Input value={editInputValue} onChange={(e) => setEditInputValue(e.target.value)} className="h-8 text-xs" />
                  <button onClick={() => handleSaveEdit(url.id)} disabled={isSaving[url.id]} className="p-1.5 text-emerald-400 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20"><Check size={14} /></button>
                  <button onClick={handleCancelEdit} disabled={isSaving[url.id]} className="p-1.5 text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20"><X size={14} /></button>
                </div>
              ) : (
                <div className="text-xs text-slate-500 mb-3 truncate">{url.originalUrl}</div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MousePointerClick size={12} />{url.clickCount}</span>
                  <span>{formatDate(url.createdAt)}</span>
                  {renderExpiryBadge(url.expiresAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Link to={`/analytics/${url.id}`} className="p-1.5 text-slate-300 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors" title="Analytics"><BarChart2 size={15} /></Link>
                  <ActionBtn onClick={() => handleEditClick(url)} title="Edit"><Pencil size={15} /></ActionBtn>
                  <ActionBtn onClick={() => handleOpenQr(url)} title="QR Code"><QrCode size={15} /></ActionBtn>
                  <ActionBtn onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/stats/${url.shortCode}`); showToast('Stats link copied', 'success'); }} title="Share"><Share2 size={15} /></ActionBtn>
                  <ActionBtn onClick={() => onDelete(url.id)} title="Delete" danger><Trash2 size={15} /></ActionBtn>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop */}
      <div className="hidden md:block dark-card overflow-hidden border-t-2 border-violet-500/50" style={{ background: 'linear-gradient(160deg, #13162a 0%, #1a1040 50%, #0d2030 100%)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Original URL','Short URL','Created','Clicks','Expires','Actions'].map(h => (
                  <th key={h} scope="col" className={`px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider ${h === 'Actions' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <AnimatePresence>
                {urls.map((url, i) => (
                  <motion.tr
                    key={url.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      {editingUrlId === url.id ? (
                        <div className="flex items-center gap-2">
                          <Input value={editInputValue} onChange={(e) => setEditInputValue(e.target.value)} className="h-8 text-xs min-w-[180px]" />
                          <button onClick={() => handleSaveEdit(url.id)} disabled={isSaving[url.id]} className="p-1.5 text-emerald-400 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-colors" title="Save"><Check size={14} /></button>
                          <button onClick={handleCancelEdit} disabled={isSaving[url.id]} className="p-1.5 text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors" title="Cancel"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-300 truncate max-w-[220px] lg:max-w-xs" title={url.originalUrl}>{url.originalUrl}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <a href={url.shortUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1.5 transition-colors">
                        {url.shortUrl.replace(/^https?:\/\//, '')}
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-300">{formatDate(url.createdAt)}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-300">
                        <MousePointerClick size={14} className="text-violet-500" />
                        {url.clickCount}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm">{renderExpiryBadge(url.expiresAt)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <CopyButton text={url.shortUrl} onCopy={() => showToast('Copied!', 'success')} />
                        <Link to={`/analytics/${url.id}`} className="p-1.5 text-slate-300 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all" title="Analytics"><BarChart2 size={16} /></Link>
                        <ActionBtn onClick={() => handleEditClick(url)} title="Edit URL"><Pencil size={16} /></ActionBtn>
                        <ActionBtn onClick={() => handleOpenQr(url)} title="QR Code"><QrCode size={16} /></ActionBtn>
                        <ActionBtn onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/stats/${url.shortCode}`); showToast('Stats link copied', 'success'); }} title="Share Stats"><Share2 size={16} /></ActionBtn>
                        <ActionBtn onClick={() => { if (window.confirm('Delete this URL?')) onDelete(url.id); }} title="Delete" danger><Trash2 size={16} /></ActionBtn>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {qrModal.isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="dark-card w-full max-w-sm overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/[0.07]">
                <h3 className="text-base font-bold text-white">QR Code</h3>
                <button onClick={handleCloseQr} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 flex flex-col items-center gap-4">
                {qrModal.isLoading ? (
                  <div className="w-48 h-48 shimmer-skeleton rounded-2xl flex items-center justify-center">
                    <span className="text-slate-600 text-sm">Generating…</span>
                  </div>
                ) : qrModal.error ? (
                  <div className="text-red-400 text-sm">{qrModal.error}</div>
                ) : qrModal.qrCodeDataUrl && (
                  <>
                    <div className="p-3 bg-white rounded-2xl shadow-xl">
                      <img src={qrModal.qrCodeDataUrl} alt="QR Code" className="w-44 h-44" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">{qrModal.url?.shortUrl?.replace(/^https?:\/\//, '')}</p>
                    <a href={qrModal.qrCodeDataUrl} download={`qr-${qrModal.url?.id}.png`}
                      className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 transition-all shadow-lg shadow-violet-500/25">
                      <Download size={15} />
                      Download PNG
                    </a>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};