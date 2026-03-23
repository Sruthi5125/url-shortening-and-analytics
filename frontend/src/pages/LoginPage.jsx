import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const LoginPage = () => {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, token } = useAuth();
  const navigate         = useNavigate();

  if (token) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: 'linear-gradient(135deg, #0b0d17 0%, #13162a 50%, #0d0f1c 100%)' }}
    >
      {/* Animated blobs */}
      <div className="auth-blob-1 absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
      <div className="auth-blob-2 absolute -bottom-48 -right-48 w-[36rem] h-[36rem] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
      <div className="auth-blob-3 absolute top-1/3 right-1/4 w-72 h-72 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/30">
            <Link2 size={30} className="stroke-[2.5] text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Sign in to <span className="gradient-text">LinkShort</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Or{' '}
          <Link to="/signup" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            create a new account
          </Link>
        </p>
      </motion.div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="dark-card py-8 px-6 sm:px-10 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" disabled={isLoading} size="lg" className="w-full mt-2">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};