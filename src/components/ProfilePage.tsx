import React, { useState, useRef } from 'react';
import { User, Lock, Camera, Loader2, X, Mail, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export function ProfilePage() {
  const { user, setUser, sendVerificationEmail } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile(user, { displayName: name });
      setUser(auth.currentUser);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const file = e.target.files[0];
      const storage = getStorage();
      const photoRef = ref(storage, `profile-photos/${user.uid}`);
      
      await uploadBytes(photoRef, file);
      const photoURL = await getDownloadURL(photoRef);
      
      await updateProfile(user, { photoURL });
      setUser(auth.currentUser);
      setSuccess('Profile photo updated successfully');
    } catch (err) {
      setError('Failed to update profile photo');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      await sendVerificationEmail();
      setSuccess('Verification email sent successfully');
    } catch (err) {
      setError('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Profile Settings</h2>

      <div className="space-y-8">
        {/* Email Verification Status */}
        {user && !user.emailVerified && (
          <div className="bg-amber-50 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="text-amber-500" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Verify Your Email</h3>
                  <p className="text-sm text-gray-600">
                    Please verify your email address to access all features
                  </p>
                </div>
              </div>
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-md hover:bg-amber-200 disabled:opacity-50"
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
        )}

        {user?.emailVerified && (
          <div className="bg-emerald-50 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Email Verified</h3>
                <p className="text-sm text-gray-600">
                  Your email address has been verified
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Photo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Photo</h3>
          <div className="flex items-center gap-6">
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User size={32} className="text-emerald-600" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
              >
                <Camera size={16} className="text-gray-600" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Upload a new profile photo. The photo should be a square image in JPG, PNG, or GIF format.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>

        {/* Change Password */}
        <form onSubmit={handleUpdatePassword} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Update Password
            </button>
          </div>
        </form>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <X size={16} />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}
      </div>
    </div>
  );
}