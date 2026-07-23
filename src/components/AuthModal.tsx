/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { api, User } from '../utils/api';
import { GoogleLogin } from '@react-oauth/google';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const { user } = await api.register({ email, password, name });
        onSuccess(user);
        onClose();
      } else {
        const { user } = await api.login({ email, password });
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    setError(null);
    setIsLoading(true);

    try {
      const { user } = await api.loginWithGoogle(credentialResponse.credential);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-cream-50 dark:bg-sepia-900 rounded-3xl shadow-2xl border border-cream-200 dark:border-sepia-800 overflow-hidden transform transition-all duration-300">

        {/* Header decoration */}
        <div className="relative p-6 pb-5 bg-gradient-to-br from-readflow-green via-readflow-olive to-stone-900 text-cream-50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-cream-200/80 hover:text-cream-50 bg-black/10 hover:bg-black/25 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>


          <h3 className="text-2xl font-serif font-bold tracking-tight text-cream-50">
            {mode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
          </h3>
          <p className="text-xs text-cream-200/90 mt-1 font-light leading-relaxed">
            {mode === 'login'
              ? 'Sign in to sync your opportunities, streaks, and visions safely.'
              : 'Start building your 1,000 opportunities journey with cloud storage.'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-cream-200 dark:border-sepia-800 bg-cream-100 dark:bg-sepia-950">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 text-sm font-serif font-bold text-center transition-all border-b-2 ${mode === 'login'
                ? 'border-readflow-green text-readflow-green dark:text-readflow-gold dark:border-readflow-gold bg-cream-50 dark:bg-sepia-900'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-cream-300'
              }`}
          >
            <LogIn className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-3 text-sm font-serif font-bold text-center transition-all border-b-2 ${mode === 'register'
                ? 'border-readflow-green text-readflow-green dark:text-readflow-gold dark:border-readflow-gold bg-cream-50 dark:bg-sepia-900'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-cream-300'
              }`}
          >
            <UserPlus className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            Create Account
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Section */}
          <div className="space-y-3">
            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Authentication Failed')}
                  theme="outline"
                  shape="pill"
                  size="large"
                  width="100%"
                  text={mode === 'login' ? 'signin_with' : 'signup_with'}
                />
              </div>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                <p className="font-semibold flex items-center gap-1.5 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Google Sign-In setup tip
                </p>
                <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
                  To enable 1-click Google Auth, add your <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/60 rounded font-mono text-[10px]">VITE_GOOGLE_CLIENT_ID</code> to <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/60 rounded font-mono text-[10px]">.env</code>. You can register/login with Email below right now!
                </p>
              </div>
            )}

            <div className="relative flex items-center justify-center pt-1">
              <div className="w-full border-t border-cream-200 dark:border-sepia-800" />
              <span className="absolute px-3 bg-cream-50 dark:bg-sepia-900 text-[10px] font-mono text-stone-400 dark:text-sepia-500 uppercase tracking-wider font-semibold">
                Email & Password
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-serif font-semibold text-sepia-800 dark:text-cream-200 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-readflow-olive dark:text-readflow-gold" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-sepia-950 border border-cream-200 dark:border-sepia-800 rounded-xl focus:ring-2 focus:ring-readflow-green dark:focus:ring-readflow-gold focus:outline-none text-sepia-900 dark:text-cream-100 placeholder:text-stone-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-serif font-semibold text-sepia-800 dark:text-cream-200 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-readflow-olive dark:text-readflow-gold" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-sepia-950 border border-cream-200 dark:border-sepia-800 rounded-xl focus:ring-2 focus:ring-readflow-green dark:focus:ring-readflow-gold focus:outline-none text-sepia-900 dark:text-cream-100 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif font-semibold text-sepia-800 dark:text-cream-200 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-readflow-olive dark:text-readflow-gold" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-sepia-950 border border-cream-200 dark:border-sepia-800 rounded-xl focus:ring-2 focus:ring-readflow-green dark:focus:ring-readflow-gold focus:outline-none text-sepia-900 dark:text-cream-100 placeholder:text-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-readflow-green to-readflow-olive dark:from-readflow-olive dark:to-readflow-green hover:brightness-110 text-cream-50 font-serif font-bold rounded-xl shadow-lg shadow-readflow-green/20 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-cream-50/30 border-t-cream-50 rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to Account
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Free Account
                </>
              )}
            </button>
          </form>

          {/* Trust Badge */}
          <p className="text-xs text-center text-sepia-500 dark:text-sepia-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-readflow-green dark:text-readflow-lightgreen shrink-0" />
            Your data is stored securely and backed up automatically.
          </p>
        </div>

      </div>
    </div>
  );
};
