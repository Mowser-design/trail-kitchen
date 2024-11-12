import React from 'react';
import { LogIn } from 'lucide-react';

interface AuthRequiredProps {
  onSignIn: () => void;
}

export function AuthRequired({ onSignIn }: AuthRequiredProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
        <LogIn className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Sign In Required
        </h2>
        <p className="text-gray-600 mb-6">
          Please sign in to access this feature. Create a free account to start planning your trail meals.
        </p>
        <button
          onClick={onSignIn}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <LogIn size={20} />
          Sign In
        </button>
      </div>
    </div>
  );
}