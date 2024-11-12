import React, { useState } from 'react';
import { AlertTriangle, Mail, Loader2, CheckCircle2, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function EmailVerificationBanner() {
  const { user, sendVerificationEmail, loading } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);

  if (!user || user.emailVerified) return null;

  const handleResendVerification = async () => {
    await sendVerificationEmail();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="bg-amber-50 border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-500" size={20} />
            <span className="text-sm text-amber-800">
              Please verify your email address to access all features.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {showSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm">
                <CheckCircle2 size={16} />
                Verification email sent
              </div>
            )}
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-amber-700 hover:bg-amber-100 rounded-md disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Mail size={16} />
              )}
              Resend Verification Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}