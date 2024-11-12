import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { format, differenceInDays } from 'date-fns';
import { BarChart3, Calendar, Scale, Utensils, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useSettingsStore } from '../store/settingsStore';
import { Trip, MealType } from '../types';
import { formatWeight } from '../utils/units';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function Analytics() {
  const { trips } = useTripStore();
  const { unitSystem } = useSettingsStore();
  const [viewMode, setViewMode] = useState<'tiles' | 'table'>('tiles');

  const stats = useMemo(() => {
    const completedTrips = trips.filter((trip) => trip.status === 'completed');
    
    if (completedTrips.length === 0) {
      return null;
    }

    const totalDays = completedTrips.reduce(
      (sum, trip) => sum + differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1,
      0
    );

    const avgDuration = totalDays / completedTrips.length;

    const mealStats = completedTrips.reduce(
      (acc, trip) => {
        trip.days.forEach((day) => {
          Object.entries(day.meals).forEach(([type, meals]) => {
            const dailyCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
            const dailyWeight = meals.reduce((sum, meal) => sum + meal.weight, 0);
            
            acc.totalCalories += dailyCalories;
            acc.totalWeight += dailyWeight;
            acc.mealTypeDistribution[type as MealType] = 
              (acc.mealTypeDistribution[type as MealType] || 0) + dailyCalories;
          });
        });
        return acc;
      },
      { 
        totalCalories: 0, 
        totalWeight: 0, 
        mealTypeDistribution: {} as Record<MealType, number>
      }
    );

    const avgDailyCalories = Math.round(mealStats.totalCalories / totalDays);
    const avgDailyWeight = Math.round(mealStats.totalWeight / totalDays);

    return {
      tripCount: completedTrips.length,
      avgDuration,
      avgDailyCalories,
      avgDailyWeight,
      mealTypeDistribution: mealStats.mealTypeDistribution,
    };
  }, [trips]);

  const tripDetails = useMemo(() => {
    return trips
      .filter(trip => trip.status === 'completed')
      .map(trip => {
        const duration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
        const totalStats = trip.days.reduce(
          (acc, day) => {
            const dayStats = Object.values(day.meals).reduce(
              (mealAcc, meals) => ({
                calories: mealAcc.calories + meals.reduce((sum, meal) => sum + meal.calories, 0),
                weight: mealAcc.weight + meals.reduce((sum, meal) => sum + meal.weight, 0),
              }),
              { calories: 0, weight: 0 }
            );
            return {
              calories: acc.calories + dayStats.calories,
              weight: acc.weight + dayStats.weight,
            };
          },
          { calories: 0, weight: 0 }
        );

        return {
          id: trip.id,
          name: trip.name,
          startDate: trip.startDate,
          endDate: trip.endDate,
          duration,
          totalCalories: totalStats.calories,
          avgDailyCalories: Math.round(totalStats.calories / duration),
          totalWeight: totalStats.weight,
          avgDailyWeight: Math.round(totalStats.weight / duration),
        };
      })
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  }, [trips]);

  const mealTypeColors = {
    breakfast: 'rgb(251, 191, 36)',
    lunch: 'rgb(16, 185, 129)',
    dinner: 'rgb(99, 102, 241)',
    snack: 'rgb(244, 63, 94)',
    drink: 'rgb(14, 165, 233)',
  };

  const distributionData = {
    labels: Object.keys(stats?.mealTypeDistribution || {}).map(
      (type) => type.charAt(0).toUpperCase() + type.slice(1)
    ),
    datasets: [
      {
        data: Object.values(stats?.mealTypeDistribution || {}),
        backgroundColor: Object.keys(stats?.mealTypeDistribution || {}).map(
          (type) => mealTypeColors[type as MealType]
        ),
      },
    ],
  };

  const recentTripsData = useMemo(() => {
    const recentTrips = [...trips]
      .filter((trip) => trip.status === 'completed')
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
      .slice(0, 5);

    return {
      labels: recentTrips.map((trip) => trip.name),
      datasets: [
        {
          label: 'Daily Calories',
          data: recentTrips.map((trip) => {
            const days = trip.days.length;
            const totalCalories = trip.days.reduce(
              (sum, day) =>
                sum +
                Object.values(day.meals).reduce(
                  (mealSum, meals) =>
                    mealSum + meals.reduce((calSum, meal) => calSum + meal.calories, 0),
                  0
                ),
              0
            );
            return Math.round(totalCalories / days);
          }),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
        },
      ],
    };
  }, [trips]);

  if (!stats) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h2>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">
            Complete some trips to see your analytics data!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-emerald-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Avg Duration</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.avgDuration.toFixed(1)} <span className="text-lg text-gray-600">days</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Utensils className="text-emerald-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Daily Calories</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.avgDailyCalories} <span className="text-lg text-gray-600">cal</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="text-emerald-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Daily Weight</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatWeight(stats.avgDailyWeight, unitSystem === 'imperial')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-emerald-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Trips Completed</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.tripCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Calorie Distribution by Meal Type
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut
              data={distributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Recent Trips - Daily Calories
          </h3>
          <div className="h-[300px]">
            <Bar
              data={recentTripsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Calories per Day',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Trip Details</h3>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('tiles')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'tiles'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <TableIcon size={20} />
            </button>
          </div>
        </div>

        {viewMode === 'tiles' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tripDetails.map((trip) => (
              <div key={trip.id} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">{trip.name}</h4>
                <div className="text-sm text-gray-600 mb-4">
                  {format(new Date(trip.startDate), 'MMM d')} -{' '}
                  {format(new Date(trip.endDate), 'MMM d, yyyy')}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{trip.duration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Calories:</span>
                    <span className="font-medium">{trip.totalCalories.toLocaleString()} cal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Avg Calories:</span>
                    <span className="font-medium">{trip.avgDailyCalories.toLocaleString()} cal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Weight:</span>
                    <span className="font-medium">
                      {formatWeight(trip.totalWeight, unitSystem === 'imperial')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Avg Weight:</span>
                    <span className="font-medium">
                      {formatWeight(trip.avgDailyWeight, unitSystem === 'imperial')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cal/Day</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Weight/Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tripDetails.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{trip.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {format(new Date(trip.startDate), 'MMM d')} -{' '}
                      {format(new Date(trip.endDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{trip.duration} days</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{trip.totalCalories.toLocaleString()} cal</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{trip.avgDailyCalories.toLocaleString()} cal</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatWeight(trip.totalWeight, unitSystem === 'imperial')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatWeight(trip.avgDailyWeight, unitSystem === 'imperial')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}