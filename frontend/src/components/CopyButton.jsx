import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const CopyButton = ({ text, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className={`p-1.5 rounded-lg transition-all duration-200 ${
        copied
          ? 'text-emerald-400 bg-emerald-500/10'
          : 'text-slate-300 hover:text-violet-400 hover:bg-violet-500/10'
      }`}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
};