import { create } from 'zustand';
import { Trip, Meal } from '../types';
import { saveTrip, updateTrip as updateFirebaseTrip, deleteTrip as deleteFirebaseTrip } from './firebaseStore';

interface TripStore {
  trips: Trip[];
  activeTrip: Trip | null;
  setTrips: (trips: Trip[]) => void;
  addTrip: (trip: Trip) => Promise<void>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  setActiveTrip: (tripId: string) => void;
  clearActiveTrip: () => void;
  updateTripStatus: (tripId: string, status: 'active' | 'completed') => Promise<void>;
  addMealToDay: (tripId: string, dayId: string, mealType: keyof Trip['days'][0]['meals'], meal: Meal) => Promise<void>;
  updateMealInDay: (tripId: string, dayId: string, mealType: keyof Trip['days'][0]['meals'], mealId: string, updatedMeal: Meal) => Promise<void>;
  removeMealFromDay: (tripId: string, dayId: string, mealType: keyof Trip['days'][0]['meals'], mealId: string) => Promise<void>;
  updateAllMealsWithFoodItem: (foodItemId: string, isFavorite: boolean) => Promise<void>;
}

export const useTripStore = create<TripStore>()((set, get) => ({
  trips: [],
  activeTrip: null,
  setTrips: (trips) => {
    set({ 
      trips,
      activeTrip: get().activeTrip 
        ? trips.find(t => t.id === get().activeTrip?.id) || null
        : null
    });
  },
  addTrip: async (trip) => {
    await saveTrip(trip);
  },
  updateTrip: async (tripId, updates) => {
    const trip = get().trips.find(t => t.id === tripId);
    if (!trip) return;

    const updatedTrip = { ...trip, ...updates };
    await updateFirebaseTrip(tripId, updatedTrip);
  },
  deleteTrip: async (tripId) => {
    await deleteFirebaseTrip(tripId);
  },
  setActiveTrip: (tripId) =>
    set((state) => ({
      activeTrip: state.trips.find((t) => t.id === tripId) || state.activeTrip,
    })),
  clearActiveTrip: () => set({ activeTrip: null }),
  updateTripStatus: async (tripId, status) => {
    const trip = get().trips.find(t => t.id === tripId);
    if (!trip) return;

    const updatedTrip = { ...trip, status };
    await updateFirebaseTrip(tripId, updatedTrip);
  },
  addMealToDay: async (tripId, dayId, mealType, meal) => {
    const trip = get().trips.find(t => t.id === tripId);
    if (!trip) return;

    const updatedTrip = {
      ...trip,
      days: trip.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              meals: {
                ...day.meals,
                [mealType]: [...day.meals[mealType], meal],
              },
            }
          : day
      ),
    };

    await updateFirebaseTrip(tripId, updatedTrip);
  },
  updateMealInDay: async (tripId, dayId, mealType, mealId, updatedMeal) => {
    const trip = get().trips.find(t => t.id === tripId);
    if (!trip) return;

    const updatedTrip = {
      ...trip,
      days: trip.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              meals: {
                ...day.meals,
                [mealType]: day.meals[mealType].map((meal) =>
                  meal.id === mealId ? updatedMeal : meal
                ),
              },
            }
          : day
      ),
    };

    await updateFirebaseTrip(tripId, updatedTrip);
  },
  removeMealFromDay: async (tripId, dayId, mealType, mealId) => {
    const trip = get().trips.find(t => t.id === tripId);
    if (!trip) return;

    const updatedTrip = {
      ...trip,
      days: trip.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              meals: {
                ...day.meals,
                [mealType]: day.meals[mealType].filter(
                  (meal) => meal.id !== mealId
                ),
              },
            }
          : day
      ),
    };

    await updateFirebaseTrip(tripId, updatedTrip);
  },
  updateAllMealsWithFoodItem: async (foodItemId: string, isFavorite: boolean) => {
    const { trips } = get();
    
    for (const trip of trips) {
      let tripUpdated = false;
      const updatedTrip = {
        ...trip,
        days: trip.days.map((day) => ({
          ...day,
          meals: Object.fromEntries(
            Object.entries(day.meals).map(([type, meals]) => [
              type,
              meals.map((meal) => {
                if (meal.foodItems[0]?.id === foodItemId) {
                  tripUpdated = true;
                  return {
                    ...meal,
                    isFavorite,
                    foodItems: [{ ...meal.foodItems[0], isFavorite }],
                  };
                }
                return meal;
              }),
            ])
          ),
        })),
      };
      
      if (tripUpdated) {
        await updateFirebaseTrip(trip.id, updatedTrip);
      }
    }
  },
}));