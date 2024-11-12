export const mealTypeOrder: Record<string, number> = {
  breakfast: 1,
  lunch: 2,
  dinner: 3,
  snack: 4,
  drink: 5,
};

export const sortMealTypes = (a: string, b: string): number => {
  return (mealTypeOrder[a] || 999) - (mealTypeOrder[b] || 999);
};