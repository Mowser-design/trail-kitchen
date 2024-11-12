import { create } from 'zustand';
import { FoodItem } from '../types';
import { saveFoodItem, updateFoodItem, deleteFoodItem } from './firebaseStore';
import { useTripStore } from './tripStore';

interface FoodStore {
  foodItems: FoodItem[];
  setFoodItems: (items: FoodItem[]) => void;
  addFoodItem: (item: FoodItem) => void;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => void;
  deleteFoodItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getFavorites: () => FoodItem[];
  searchFoodItems: (query: string) => FoodItem[];
  getByMealType: (type: string) => FoodItem[];
}

export const useFoodStore = create<FoodStore>()((set, get) => ({
  foodItems: [],
  setFoodItems: (items) => set({ foodItems: items }),
  addFoodItem: async (item) => {
    await saveFoodItem(item);
  },
  updateFoodItem: async (id, updates) => {
    await updateFoodItem(id, updates);
  },
  deleteFoodItem: async (id) => {
    await deleteFoodItem(id);
  },
  toggleFavorite: async (id) => {
    const foodItem = get().foodItems.find(item => item.id === id);
    if (foodItem) {
      const newFavoriteStatus = !foodItem.isFavorite;
      await updateFoodItem(id, { isFavorite: newFavoriteStatus });
      useTripStore.getState().updateAllMealsWithFoodItem(id, newFavoriteStatus);
    }
  },
  getFavorites: () => get().foodItems.filter((item) => item.isFavorite),
  searchFoodItems: (query) =>
    get().foodItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.brand.toLowerCase().includes(query.toLowerCase())
    ),
  getByMealType: (type) =>
    get().foodItems.filter((item) => item.mealTypes.includes(type)),
}));