import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Coffee, Cookie, Soup, Sunrise, Sunset, Plus } from 'lucide-react';
import { useFoodStore } from '../store/foodStore';
import { MealType, FoodItem, Meal } from '../types';
import { AddMealModal } from './AddMealModal';

const mealIcons = {
  breakfast: Sunrise,
  lunch: Soup,
  dinner: Sunset,
  snack: Cookie,
  drink: Coffee,
};

const mealColors = {
  breakfast: 'bg-amber-50 hover:bg-amber-100',
  lunch: 'bg-emerald-50 hover:bg-emerald-100',
  dinner: 'bg-indigo-50 hover:bg-indigo-100',
  snack: 'bg-rose-50 hover:bg-rose-100',
  drink: 'bg-sky-50 hover:bg-sky-100',
};

interface MealPlannerProps {
  dayId: string;
  meals: Record<MealType, Meal[]>;
  onAddMeal: (type: MealType, meal: Meal) => void;
  onMoveMeal: (fromType: MealType, toType: MealType, mealId: string) => void;
  onRemoveMeal: (type: MealType, mealId: string) => void;
}

export function MealPlanner({ dayId, meals, onAddMeal, onMoveMeal, onRemoveMeal }: MealPlannerProps) {
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const { getFavorites } = useFoodStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const [fromType] = (active.id as string).split('-');
      const [toType] = (over.id as string).split('-');
      
      if (fromType !== toType) {
        onMoveMeal(
          fromType as MealType,
          toType as MealType,
          active.id as string
        );
      }
    }
  };

  const handleAddMeal = (type: MealType) => {
    setSelectedMealType(type);
    setIsAddingMeal(true);
  };

  const handleMealAdded = (meal: Meal) => {
    if (selectedMealType) {
      onAddMeal(selectedMealType, meal);
    }
    setIsAddingMeal(false);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {(Object.keys(meals) as MealType[]).map((type) => {
          const Icon = mealIcons[type];
          return (
            <div key={type} className={`rounded-lg p-4 ${mealColors[type]}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={18} className="text-gray-600" />
                  <h4 className="font-medium text-gray-800 capitalize">{type}</h4>
                </div>
                <button
                  onClick={() => handleAddMeal(type)}
                  className="p-1 rounded-full hover:bg-white/50"
                >
                  <Plus size={16} className="text-gray-600" />
                </button>
              </div>

              <SortableContext
                items={meals[type].map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {meals[type].map((meal) => (
                    <div
                      key={meal.id}
                      className="bg-white p-3 rounded border border-gray-200 shadow-sm cursor-move"
                    >
                      <div className="font-medium text-gray-800">{meal.name}</div>
                      <div className="text-sm text-gray-600">
                        {meal.calories} cal · {meal.weight}g
                      </div>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <AddMealModal
        isOpen={isAddingMeal}
        onClose={() => setIsAddingMeal(false)}
        onAdd={handleMealAdded}
        mealType={selectedMealType}
        favoriteItems={getFavorites()}
      />
    </DndContext>
  );
}