import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { Trip, DayPlan } from '../types';
import { addDays, format } from 'date-fns';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewTripModal({ isOpen, onClose }: NewTripModalProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('3');
  const addTrip = useTripStore((state) => state.addTrip);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = new Date(startDate);
    const days: DayPlan[] = Array.from({ length: parseInt(duration) }, (_, i) => ({
      id: `day-${i}`,
      date: format(addDays(start, i), 'yyyy-MM-dd'),
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
        drink: [],
      },
    }));

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      name,
      startDate,
      endDate: format(addDays(start, parseInt(duration) - 1), 'yyyy-MM-dd'),
      status: 'active',
      days,
    };

    addTrip(newTrip);
    onClose();
    setName('');
    setStartDate('');
    setDuration('3');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Create New Trip</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Trip Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                id="duration"
                min="1"
                max="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Create Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}