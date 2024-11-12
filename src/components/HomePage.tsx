import React from 'react';
import { Mountain, Utensils, Scale, BarChart3, ArrowRight, Calendar, Database, PieChart } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useAuthStore } from '../store/authStore';

interface HomePageProps {
  onNavigate: (view: 'home' | 'dashboard' | 'analytics' | 'database') => void;
  onSignIn: () => void;
}

export function HomePage({ onNavigate, onSignIn }: HomePageProps) {
  const { trips } = useTripStore();
  const { user } = useAuthStore();
  const activeTrips = trips.filter(trip => trip.status === 'active');

  const handleGetStarted = () => {
    if (user) {
      onNavigate('dashboard');
    } else {
      onSignIn();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1613339027986-b94d85708995"
            alt="Mountain hiking trail"
            className="w-full h-[600px] object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Mountain className="w-16 h-16 text-white stroke-[1.5]" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Plan Your Trail Meals with Confidence
            </h1>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Streamline your hiking meal planning with our intuitive tools and comprehensive tracking system.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-500 transition-colors text-lg font-medium"
              >
                {user ? (activeTrips.length > 0 ? 'View Your Trips' : 'Start Planning') : 'Get Started'}
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Trail Meal Planning
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trail Kitchen provides all the tools you need to plan, organise, and track your hiking meals efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Trip Planning
              </h3>
              <p className="text-gray-600">
                Create detailed meal plans for your hiking trips. Organise meals by day and type, making it easy to visualise your entire trip's nutrition.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Food Database
              </h3>
              <p className="text-gray-600">
                Build your personal database of trail foods. Track calories, weight, and servings for each item. Customise and mark favourites for quick access.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <PieChart className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Analytics
              </h3>
              <p className="text-gray-600">
                Analyse your trips with detailed statistics. Track calories and weight distribution, helping you optimise future meal plans.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-emerald-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Use Trail Kitchen?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform helps you create better meal plans while saving time and reducing stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Weight Management
                </h3>
                <p className="text-gray-600">
                  Keep track of your pack weight by monitoring the weight of each meal. Optimise your load while ensuring adequate nutrition.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Meal Variety
                </h3>
                <p className="text-gray-600">
                  Organise meals by type and maintain a diverse menu. Never eat the same thing every day unless you want to.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nutrition Tracking
                </h3>
                <p className="text-gray-600">
                  Monitor daily caloric intake and ensure you're properly fuelled for your adventure. Track nutrition metrics across your entire trip.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Trip Templates
                </h3>
                <p className="text-gray-600">
                  Save successful trip plans as templates. Quickly create new trips based on what worked well in the past.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Planning?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join Trail Kitchen today and start creating better meal plans for your outdoor adventures.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-500 transition-colors text-lg font-medium"
            >
              {user ? 'Go to Dashboard' : 'Sign Up Now'}
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}