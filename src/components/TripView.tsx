import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Coffee,
  Cookie,
  Soup,
  Sunrise,
  Sunset,
  Plus,
  ArrowLeft,
  Archive,
  Pencil,
  Scale,
  Flame,
  Trash2,
  Star,
  Calendar,
  StickyNote,
  Download,
  Loader2,
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useFoodStore } from '../store/foodStore';
import { Trip, MealType, FoodItem, Meal } from '../types';
import { AddMealModal } from './AddMealModal';
import { TripModal } from './TripModal';
import { useSettingsStore } from '../store/settingsStore';
import { formatWeight } from '../utils/units';
import { sortMealTypes } from '../utils/mealOrder';
import { TripPDF } from './TripPDF';
import { BlobProvider } from '@react-pdf/renderer';

interface TripViewProps {
  trip: Trip;
}

export function TripView({ trip }: TripViewProps) {
  const { clearActiveTrip, addMealToDay, updateMealInDay, removeMealFromDay, updateTripStatus } = useTripStore();
  const { toggleFavorite, foodItems } = useFoodStore();
  const { unitSystem } = useSettingsStore();
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [editingMeal, setEditingMeal] = useState<{ meal: Meal; dayId: string; type: MealType } | null>(null);

  const handleAddMeal = (foodItem: FoodItem, servings: number) => {
    if (!selectedDay || !selectedMealType) return;

    const meal = {
      id: `meal-${Date.now()}`,
      type: selectedMealType,
      name: foodItem.name,
      calories: foodItem.calories * servings,
      weight: foodItem.packWeight * servings,
      description: `${foodItem.brand} - ${servings} serving${servings > 1 ? 's' : ''}`,
      foodItems: [foodItem],
      isFavorite: foodItem.isFavorite,
      servings,
    };

    addMealToDay(trip.id, selectedDay, selectedMealType, meal);
    setIsAddingMeal(false);
  };

  const handleEditMeal = (foodItem: FoodItem, servings: number) => {
    if (!editingMeal) return;

    const updatedMeal = {
      ...editingMeal.meal,
      name: foodItem.name,
      calories: foodItem.calories * servings,
      weight: foodItem.packWeight * servings,
      description: `${foodItem.brand} - ${servings} serving${servings > 1 ? 's' : ''}`,
      foodItems: [foodItem],
      servings,
    };

    updateMealInDay(trip.id, editingMeal.dayId, editingMeal.type, editingMeal.meal.id, updatedMeal);
    setEditingMeal(null);
  };

  const handleRemoveMeal = (dayId: string, mealType: MealType, mealId: string) => {
    removeMealFromDay(trip.id, dayId, mealType, mealId);
  };

  const handleToggleFavorite = (meal: Meal, dayId: string, mealType: MealType) => {
    if (meal.foodItems[0]) {
      const foodItem = meal.foodItems[0];
      toggleFavorite(foodItem.id);
      
      const updatedFoodItem = foodItems.find(item => item.id === foodItem.id);
      if (updatedFoodItem) {
        const updatedMeal = {
          ...meal,
          foodItems: [{ ...updatedFoodItem }],
          isFavorite: !foodItem.isFavorite,
        };
        updateMealInDay(trip.id, dayId, mealType, meal.id, updatedMeal);
      }
    }
  };

  const handleArchiveToggle = () => {
    updateTripStatus(trip.id, trip.status === 'active' ? 'completed' : 'active');
  };

  const handleDownloadPDF = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip.name.toLowerCase().replace(/\s+/g, '-')}-meal-plan.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate trip statistics
  const tripStats = useMemo(() => {
    return trip.days.reduce(
      (acc, day) => {
        const dayCalories = Object.values(day.meals).reduce(
          (sum, meals) => sum + meals.reduce((mealSum, meal) => mealSum + meal.calories, 0),
          0
        );
        const dayWeight = Object.values(day.meals).reduce(
          (sum, meals) => sum + meals.reduce((mealSum, meal) => mealSum + meal.weight, 0),
          0
        );

        return {
          totalCalories: acc.totalCalories + dayCalories,
          totalWeight: acc.totalWeight + dayWeight,
          avgCaloriesPerDay: Math.round((acc.totalCalories + dayCalories) / trip.days.length),
          avgWeightPerDay: Math.round((acc.totalWeight + dayWeight) / trip.days.length),
        };
      },
      { totalCalories: 0, totalWeight: 0, avgCaloriesPerDay: 0, avgWeightPerDay: 0 }
    );
  }, [trip]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{trip.name}</h2>
          <div className="flex items-center gap-4 text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              {format(new Date(trip.startDate), 'MMM d')} -{' '}
              {format(new Date(trip.endDate), 'MMM d, yyyy')}
            </div>
          </div>
          {trip.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <StickyNote size={16} />
                <h3 className="font-medium">Trip Notes</h3>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">{trip.notes}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <BlobProvider document={<TripPDF trip={trip} unitSystem={unitSystem} />}>
            {({ blob, loading, error }) => (
              <button
                onClick={() => blob && handleDownloadPDF(blob)}
                disabled={loading || !!error}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  loading || error
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {loading ? 'Generating PDF...' : error ? 'Error' : 'Download PDF'}
              </button>
            )}
          </BlobProvider>
          <button
            onClick={() => setIsEditingTrip(true)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Pencil size={16} />
            Edit Trip
          </button>
          <button
            onClick={handleArchiveToggle}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Archive size={16} />
            {trip.status === 'active' ? 'Archive' : 'Reactivate'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-1">Total Calories</div>
          <div className="text-2xl font-bold text-gray-900">
            {tripStats.totalCalories.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-1">Total Weight</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatWeight(tripStats.totalWeight, unitSystem === 'imperial')}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-1">Daily Average Calories</div>
          <div className="text-2xl font-bold text-gray-900">
            {tripStats.avgCaloriesPerDay.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-1">Daily Average Weight</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatWeight(tripStats.avgWeightPerDay, unitSystem === 'imperial')}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {trip.days.map((day, index) => {
          const dayCalories = Object.values(day.meals).reduce(
            (sum, meals) => sum + meals.reduce((mealSum, meal) => mealSum + meal.calories, 0),
            0
          );
          const dayWeight = Object.values(day.meals).reduce(
            (sum, meals) => sum + meals.reduce((mealSum, meal) => mealSum + meal.weight, 0),
            0
          );

          return (
            <div key={day.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
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
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Flame size={16} />
                    {dayCalories.toLocaleString()} cal
                  </div>
                  <div className="flex items-center gap-1">
                    <Scale size={16} />
                    {formatWeight(dayWeight, unitSystem === 'imperial')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(day.meals)
                  .sort(([a], [b]) => sortMealTypes(a as MealType, b as MealType))
                  .map(([type, meals]) => {
                    const Icon = type === 'breakfast' ? Sunrise :
                              type === 'lunch' ? Soup :
                              type === 'dinner' ? Sunset :
                              type === 'snack' ? Cookie : Coffee;
                    
                    return (
                      <div
                        key={type}
                        className={`rounded-lg p-4 ${
                          type === 'breakfast' ? 'bg-amber-50' :
                          type === 'lunch' ? 'bg-emerald-50' :
                          type === 'dinner' ? 'bg-indigo-50' :
                          type === 'snack' ? 'bg-rose-50' : 'bg-sky-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icon size={18} className="text-gray-600" />
                            <h4 className="font-medium text-gray-800 capitalize">
                              {type}
                            </h4>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedDay(day.id);
                              setSelectedMealType(type as MealType);
                              setIsAddingMeal(true);
                            }}
                            className="p-1 rounded-full hover:bg-white/50"
                          >
                            <Plus size={16} className="text-gray-600" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          {meals.map((meal) => (
                            <div
                              key={meal.id}
                              className="bg-white p-3 rounded border border-gray-200 shadow-sm group"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-gray-800">
                                    {meal.name}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {meal.description}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {meal.calories} cal · {formatWeight(meal.weight, unitSystem === 'imperial')}
                                  </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleToggleFavorite(meal, day.id, type as MealType)}
                                    className={`p-1 rounded-full hover:bg-gray-100 ${
                                      meal.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                                    }`}
                                  >
                                    <Star
                                      size={14}
                                      fill={meal.isFavorite ? 'currentColor' : 'none'}
                                    />
                                  </button>
                                  <button
                                    onClick={() => setEditingMeal({ meal, dayId: day.id, type: type as MealType })}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                  >
                                    <Pencil size={14} className="text-gray-600" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveMeal(day.id, type as MealType, meal.id)}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                  >
                                    <Trash2 size={14} className="text-gray-600" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      <AddMealModal
        isOpen={isAddingMeal || editingMeal !== null}
        onClose={() => {
          setIsAddingMeal(false);
          setSelectedDay(null);
          setSelectedMealType(null);
          setEditingMeal(null);
        }}
        onAdd={editingMeal ? handleEditMeal : handleAddMeal}
        mealType={editingMeal?.type || selectedMealType}
        initialServings={editingMeal?.meal.servings}
        initialFoodItem={editingMeal?.meal.foodItems[0]}
      />

      <TripModal
        isOpen={isEditingTrip}
        onClose={() => setIsEditingTrip(false)}
        editTrip={trip}
      />
    </div>
  );
}