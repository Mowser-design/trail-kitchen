import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { Trip, DayPlan } from '../types';
import { eachDayOfInterval, format, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTrip?: Trip;
  duplicateTrip?: Trip;
}

export function TripModal({ isOpen, onClose, editTrip, duplicateTrip }: TripModalProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const addTrip = useTripStore((state) => state.addTrip);
  const updateTrip = useTripStore((state) => state.updateTrip);

  useEffect(() => {
    if (editTrip) {
      setName(editTrip.name);
      setStartDate(editTrip.startDate);
      setEndDate(editTrip.endDate);
      setNotes(editTrip.notes || '');
    } else if (duplicateTrip) {
      // Remove any existing "(Copy)" suffix before adding a new one
      const baseName = duplicateTrip.name.replace(/\s*\(Copy\)$/, '');
      setName(`${baseName} (Copy)`);
      setStartDate(duplicateTrip.startDate);
      setEndDate(duplicateTrip.endDate);
      setNotes(duplicateTrip.notes || '');
    } else {
      setName('');
      setStartDate('');
      setEndDate('');
      setNotes('');
    }
  }, [editTrip, duplicateTrip, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let days: DayPlan[];
    const daysInterval = eachDayOfInterval({ start, end });
    
    if (duplicateTrip) {
      // When duplicating, create new IDs but keep all meal data
      // Map the original days to the new date range
      days = daysInterval.map((date, index) => {
        const originalDay = duplicateTrip.days[index % duplicateTrip.days.length];
        return {
          id: `day-${uuidv4()}`,
          date: format(date, 'yyyy-MM-dd'),
          meals: {
            breakfast: originalDay.meals.breakfast.map(meal => ({ ...meal, id: `meal-${uuidv4()}` })),
            lunch: originalDay.meals.lunch.map(meal => ({ ...meal, id: `meal-${uuidv4()}` })),
            dinner: originalDay.meals.dinner.map(meal => ({ ...meal, id: `meal-${uuidv4()}` })),
            snack: originalDay.meals.snack.map(meal => ({ ...meal, id: `meal-${uuidv4()}` })),
            drink: originalDay.meals.drink.map(meal => ({ ...meal, id: `meal-${uuidv4()}` })),
          },
        };
      });
    } else {
      // For new trips, create empty meal arrays
      days = daysInterval.map((date) => ({
        id: `day-${uuidv4()}`,
        date: format(date, 'yyyy-MM-dd'),
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: [],
          drink: [],
        },
      }));
    }

    if (editTrip) {
      updateTrip(editTrip.id, {
        name,
        startDate,
        endDate,
        notes,
        days,
      });
    } else {
      const newTrip: Trip = {
        id: `trip-${uuidv4()}`,
        name,
        startDate,
        endDate,
        notes,
        status: 'active',
        days,
      };
      addTrip(newTrip);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {editTrip ? 'Edit Trip' : duplicateTrip ? 'Duplicate Trip' : 'Create New Trip'}
          </h2>
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
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Trip Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              {editTrip ? 'Save Changes' : duplicateTrip ? 'Create Copy' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}