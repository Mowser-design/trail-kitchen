import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Plus, Minus, ArrowUpDown } from 'lucide-react';
import { MealType, FoodItem } from '../types';
import { useFoodStore } from '../store/foodStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatWeight } from '../utils/units';
import { FoodItemModal } from './FoodItemModal';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (foodItem: FoodItem, servings: number) => void;
  mealType: MealType | null;
  initialServings?: number;
  initialFoodItem?: FoodItem;
}

type SortOption = 'name' | 'brand' | 'favorite';

export function AddMealModal({
  isOpen,
  onClose,
  onAdd,
  mealType,
  initialServings,
  initialFoodItem,
}: AddMealModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [isCreatingCustomItem, setIsCreatingCustomItem] = useState(false);
  
  const { foodItems } = useFoodStore();
  const { unitSystem } = useSettingsStore();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedItem(null);
      setServings(1);
      setIsCreatingCustomItem(false);
    }
  }, [isOpen]);

  // Set initial values when editing
  useEffect(() => {
    if (initialFoodItem) {
      setSelectedItem(initialFoodItem);
      setServings(initialServings || 1);
    }
  }, [initialFoodItem, initialServings]);

  const filteredAndSortedItems = useMemo(() => {
    let items = searchQuery
      ? foodItems.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.brand.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : foodItems;

    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'brand':
          return a.brand.localeCompare(b.brand);
        case 'favorite':
          if (a.isFavorite === b.isFavorite) {
            return a.name.localeCompare(b.name);
          }
          return b.isFavorite ? 1 : -1;
        default:
          return 0;
      }
    });
  }, [foodItems, searchQuery, sortBy]);

  const handleAddMeal = () => {
    if (!selectedItem) return;
    onAdd(selectedItem, servings);
    onClose();
  };

  const handleCustomItemCreated = (newItem: FoodItem) => {
    setSelectedItem(newItem);
    setIsCreatingCustomItem(false);
  };

  if (!isOpen || !mealType) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialFoodItem ? 'Edit' : 'Add'} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {!selectedItem && !isCreatingCustomItem && (
          <>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search food items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="brand">Sort by Brand</option>
                <option value="favorite">Sort by Favorite</option>
              </select>
            </div>

            <button
              onClick={() => setIsCreatingCustomItem(true)}
              className="w-full mb-4 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Create Custom Item
            </button>

            <div className="mt-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {filteredAndSortedItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-200 text-left transition-colors"
                  >
                    <div>
                      <div className="font-medium text-gray-800">
                        {item.isFavorite && <span className="text-yellow-500 mr-1">★</span>}
                        {item.name}
                        {item.isCustom && (
                          <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{item.brand}</div>
                      <div className="text-sm text-gray-600">
                        {formatWeight(item.packWeight, unitSystem === 'imperial')} ·{' '}
                        {item.calories} cal
                      </div>
                    </div>
                    <Plus size={20} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedItem && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-gray-800 mb-1">{selectedItem.name}</div>
              <div className="text-sm text-gray-600">{selectedItem.brand}</div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Servings:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-medium">{servings}</span>
                <button
                  type="button"
                  onClick={() => setServings(servings + 1)}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="ml-auto text-sm text-gray-600">
                {formatWeight(selectedItem.packWeight * servings, unitSystem === 'imperial')} ·{' '}
                {selectedItem.calories * servings} cal
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Back
              </button>
              <button
                onClick={handleAddMeal}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
              >
                {initialFoodItem ? 'Save Changes' : 'Add to Meal Plan'}
              </button>
            </div>
          </div>
        )}

        {isCreatingCustomItem && (
          <FoodItemModal
            isOpen={true}
            onClose={() => setIsCreatingCustomItem(false)}
            onItemCreated={handleCustomItemCreated}
            initialMealType={mealType}
            isCustomItem={true}
          />
        )}
      </div>
    </div>
  );
}