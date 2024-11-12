import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFoodStore } from '../store/foodStore';
import { FoodItem, MealType } from '../types';

interface FoodItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated?: (item: FoodItem) => void;
  editItem?: FoodItem;
  initialMealType?: MealType;
  isCustomItem?: boolean;
}

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'drink'];

export function FoodItemModal({ 
  isOpen, 
  onClose, 
  onItemCreated,
  editItem,
  initialMealType,
  isCustomItem = false,
}: FoodItemModalProps) {
  const { addFoodItem, updateFoodItem } = useFoodStore();
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [packWeight, setPackWeight] = useState('');
  const [calories, setCalories] = useState('');
  const [servingsPerPack, setServingsPerPack] = useState('');
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>([]);

  useEffect(() => {
    if (editItem) {
      setBrand(editItem.brand);
      setName(editItem.name);
      setPackWeight(editItem.packWeight.toString());
      setCalories(editItem.calories.toString());
      setServingsPerPack(editItem.servingsPerPack.toString());
      setSelectedMealTypes(editItem.mealTypes);
    } else if (initialMealType) {
      setSelectedMealTypes([initialMealType]);
    } else {
      setBrand('');
      setName('');
      setPackWeight('');
      setCalories('');
      setServingsPerPack('');
      setSelectedMealTypes([]);
    }
  }, [editItem, initialMealType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const caloriesNum = parseInt(calories);
    const servingsNum = parseInt(servingsPerPack);
    const caloriesPerServing = Math.round(caloriesNum / servingsNum);

    const itemData = {
      brand,
      name,
      packWeight: parseInt(packWeight),
      calories: caloriesNum,
      servingsPerPack: servingsNum,
      caloriesPerServing,
      mealTypes: selectedMealTypes,
      isFavorite: editItem?.isFavorite || false,
      isCustom: isCustomItem,
    };

    if (editItem) {
      updateFoodItem(editItem.id, itemData);
      onClose();
    } else {
      const newItem = {
        id: `food-${Date.now()}`,
        ...itemData,
      };
      addFoodItem(newItem);
      
      if (onItemCreated) {
        onItemCreated(newItem);
      } else {
        onClose();
      }
    }
  };

  const toggleMealType = (type: MealType) => {
    setSelectedMealTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {editItem ? 'Edit Food Item' : 'Create Custom Food Item'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="packWeight" className="block text-sm font-medium text-gray-700 mb-1">
                  Pack Weight (g)
                </label>
                <input
                  type="number"
                  id="packWeight"
                  value={packWeight}
                  onChange={(e) => setPackWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
                  Calories per Pack
                </label>
                <input
                  type="number"
                  id="calories"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="servingsPerPack" className="block text-sm font-medium text-gray-700 mb-1">
                Servings per Pack
              </label>
              <input
                type="number"
                id="servingsPerPack"
                value={servingsPerPack}
                onChange={(e) => setServingsPerPack(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {mealTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleMealType(type)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedMealTypes.includes(type)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
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
              {editItem ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}