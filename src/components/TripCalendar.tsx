import React from 'react';
import { format } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Coffee, Cookie, Soup, Sunrise, Sunset } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { MealType } from '../types';

const mealIcons = {
  breakfast: Sunrise,
  lunch: Soup,
  dinner: Sunset,
  snack: Cookie,
  drink: Coffee,
};

export function TripCalendar() {
  const { activeTrip } = useTripStore();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  if (!activeTrip) return null;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        {activeTrip.name} - Meal Plan
      </h2>

      <DndContext sensors={sensors} collisionDetection={closestCenter}>
        <div className="grid grid-cols-1 gap-6">
          {activeTrip.days.map((day, index) => (
            <div
              key={day.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Day</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {index + 1}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Date</div>
                  <div className="text-lg font-medium">
                    {format(new Date(day.date), 'EEEE, MMM d')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {(Object.keys(day.meals) as MealType[]).map((mealType) => {
                  const Icon = mealIcons[mealType];
                  return (
                    <div
                      key={mealType}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Icon size={18} className="text-gray-600" />
                        <h4 className="font-medium text-gray-800 capitalize">
                          {mealType}
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {day.meals[mealType].map((meal) => (
                          <div
                            key={meal.id}
                            className="bg-white p-3 rounded border border-gray-200 shadow-sm"
                          >
                            <div className="font-medium text-gray-800">
                              {meal.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {meal.calories} cal · {meal.weight}g
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}