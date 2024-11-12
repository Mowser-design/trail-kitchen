import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function EmailVerification() {
  const [searchParams] = useSearchParams();
  const { verifyEmail, loading, error } = useAuthStore();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      if (token) {
        try {
          await verifyEmail(token);
          setVerified(true);
        } catch (error) {
          // Error is handled by the store
        }
      }
    };

    verifyToken();
  }, [searchParams, verifyEmail]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <Loader2 className="w-12 h-12 text-emerald-600 mx-auto animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Verifying Your Email
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Verification Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Email Verified Successfully
          </h2>
          <p className="text-gray-600 mb-6">
            Your email has been verified. You can now access all features of Trail Kitchen.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Continue to Trail Kitchen
          </a>
        </div>
      </div>
    );
  }

  return null;
}