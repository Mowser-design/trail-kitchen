import React, { useState } from 'react';
import { X, Loader2, Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, mode: initialMode }: AuthModalProps) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { signIn, signUp, loading, error, clearError } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (mode === 'signup') {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (error) {
      // Error is handled by the store
    }
  };

  const toggleMode = () => {
    clearError();
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {mode === 'signin' ? 'Sign up now' : 'Sign in instead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}