export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';

export interface FoodItem {
  id: string;
  brand: string;
  name: string;
  packWeight: number;
  calories: number;
  servingsPerPack: number;
  caloriesPerServing: number;
  mealTypes: MealType[];
  isFavorite: boolean;
  isCustom?: boolean;
}

export interface Meal {
  id: string;
  type: MealType;
  name: string;
  calories: number;
  weight: number;
  description: string;
  foodItems: FoodItem[];
  isFavorite: boolean;
  servings: number;
}

export interface DayPlan {
  id: string;
  date: string;
  meals: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snack: Meal[];
    drink: Meal[];
  };
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  notes?: string;
  status: 'active' | 'completed';
  days: DayPlan[];
}