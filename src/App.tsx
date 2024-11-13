import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LayoutGrid, BarChart3, Database, Mountain, Home, LogIn, LogOut, UserPlus, User, Menu, X } from 'lucide-react';
import { TripDashboard } from './components/TripDashboard';
import { TripView } from './components/TripView';
import { Analytics } from './components/Analytics';
import { FoodDatabase } from './components/FoodDatabase';
import { UnitToggle } from './components/UnitToggle';
import { HomePage } from './components/HomePage';
import { AuthModal } from './components/AuthModal';
import { AuthRequired } from './components/AuthRequired';
import { ProfilePage } from './components/ProfilePage';
import { EmailVerification } from './components/EmailVerification';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { useTripStore } from './store/tripStore';
import { useFoodStore } from './store/foodStore';
import { useAuthStore } from './store/authStore';
import { subscribeToTrips, subscribeToFoodItems } from './store/firebaseStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';

export function App() {
  const [activeView, setActiveView] = useState<'home' | 'dashboard' | 'analytics' | 'database' | 'profile'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activeTrip, clearActiveTrip, setTrips } = useTripStore();
  const { setFoodItems } = useFoodStore();
  const { user, setUser } = useAuthStore();
  const [authModal, setAuthModal] = useState<'signin' | 'signup' | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (!user) {
      setTrips([]);
      setFoodItems([]);
      return;
    }

    const unsubscribeTrips = subscribeToTrips((trips) => {
      setTrips(trips);
    });

    const unsubscribeFoodItems = subscribeToFoodItems((items) => {
      setFoodItems(items);
    });

    return () => {
      unsubscribeTrips();
      unsubscribeFoodItems();
    };
  }, [user, setTrips, setFoodItems]);

  const handleNavigate = (view: 'home' | 'dashboard' | 'analytics' | 'database' | 'profile') => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    if (view !== 'dashboard') {
      clearActiveTrip();
    }
  };

  const showUnitToggle = activeView !== 'home' && activeView !== 'profile';

  const renderContent = () => {
    if (activeTrip) {
      return user ? (
        <TripView trip={activeTrip} />
      ) : (
        <AuthRequired onSignIn={() => setAuthModal('signin')} />
      );
    }

    switch (activeView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} onSignIn={() => setAuthModal('signin')} />;
      case 'dashboard':
        return user ? (
          <TripDashboard />
        ) : (
          <AuthRequired onSignIn={() => setAuthModal('signin')} />
        );
      case 'database':
        return user ? (
          <FoodDatabase />
        ) : (
          <AuthRequired onSignIn={() => setAuthModal('signin')} />
        );
      case 'analytics':
        return user ? (
          <Analytics />
        ) : (
          <AuthRequired onSignIn={() => setAuthModal('signin')} />
        );
      case 'profile':
        return user ? (
          <ProfilePage />
        ) : (
          <AuthRequired onSignIn={() => setAuthModal('signin')} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <EmailVerificationBanner />
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600">
                <Mountain className="w-8 h-8 stroke-[1.5]" />
              </span>
              <h1 className="text-xl font-bold text-gray-900">Trail Kitchen</h1>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-4">
              {showUnitToggle && <UnitToggle />}
              <nav className="flex space-x-1">
                <button
                  onClick={() => handleNavigate('home')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeView === 'home'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Home size={18} />
                    Home
                  </span>
                </button>

                {user && (
                  <>
                    <button
                      onClick={() => {
                        clearActiveTrip();
                        handleNavigate('dashboard');
                      }}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        activeView === 'dashboard' && !activeTrip
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <LayoutGrid size={18} />
                        Trips
                      </span>
                    </button>

                    <button
                      onClick={() => handleNavigate('database')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        activeView === 'database'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Database size={18} />
                        Food Database
                      </span>
                    </button>

                    <button
                      onClick={() => handleNavigate('analytics')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        activeView === 'analytics'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <BarChart3 size={18} />
                        Analytics
                      </span>
                    </button>
                  </>
                )}
              </nav>

              <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                {user ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleNavigate('profile')}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                        activeView === 'profile'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || ''}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <User size={18} />
                      )}
                      {user.displayName}
                    </button>
                    <button
                      onClick={() => useAuthStore.getState().signOut()}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setAuthModal('signin')}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      <LogIn size={18} />
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthModal('signup')}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
                    >
                      <UserPlus size={18} />
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`md:hidden overflow-y-auto max-h-[calc(100vh-4rem)] ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              <button
                onClick={() => handleNavigate('home')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === 'home'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home size={18} />
                Home
              </button>

              {user && (
                <>
                  <button
                    onClick={() => {
                      clearActiveTrip();
                      handleNavigate('dashboard');
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                      activeView === 'dashboard' && !activeTrip
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutGrid size={18} />
                    Trips
                  </button>

                  <button
                    onClick={() => handleNavigate('database')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                      activeView === 'database'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Database size={18} />
                    Food Database
                  </button>

                  <button
                    onClick={() => handleNavigate('analytics')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                      activeView === 'analytics'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 size={18} />
                    Analytics
                  </button>

                  <button
                    onClick={() => handleNavigate('profile')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                      activeView === 'profile'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || ''}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User size={18} />
                    )}
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      useAuthStore.getState().signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              )}

              {!user && (
                <>
                  <button
                    onClick={() => {
                      setAuthModal('signin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    <LogIn size={18} />
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthModal('signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
                  >
                    <UserPlus size={18} />
                    Sign Up
                  </button>
                </>
              )}

              {showUnitToggle && (
                <div className="pt-2">
                  <UnitToggle />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={activeView === 'home' ? '' : 'max-w-7xl mx-auto py-6'}>
        <Routes>
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="*" element={renderContent()} />
        </Routes>
      </main>

      {authModal && (
        <AuthModal
          isOpen={true}
          onClose={() => setAuthModal(null)}
          mode={authModal}
        />
      )}
    </div>
  );
}