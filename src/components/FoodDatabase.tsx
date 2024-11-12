import React, { useState, useMemo } from 'react';
import { Plus, Search, Star, Pencil, Trash2, LayoutGrid, Table as TableIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { useFoodStore } from '../store/foodStore';
import { useSettingsStore } from '../store/settingsStore';
import { FoodItem, MealType } from '../types';
import { FoodItemModal } from './FoodItemModal';
import { formatWeight } from '../utils/units';

type SortField = 'name' | 'weight' | 'caloriesPerServing';
type SortDirection = 'asc' | 'desc';

const mealTypeOptions: { value: MealType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snacks' },
  { value: 'drink', label: 'Drinks' },
];

export function FoodDatabase() {
  const { foodItems, toggleFavorite, deleteFoodItem } = useFoodStore();
  const { unitSystem } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FoodItem | undefined>();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedMealType, setSelectedMealType] = useState<MealType | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let items = foodItems;

    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedMealType !== 'all') {
      items = items.filter((item) => item.mealTypes.includes(selectedMealType));
    }

    return [...items].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'weight':
          comparison = a.packWeight - b.packWeight;
          break;
        case 'caloriesPerServing':
          comparison = a.caloriesPerServing - b.caloriesPerServing;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [foodItems, searchQuery, selectedMealType, sortField, sortDirection]);

  const handleEditClick = (item: FoodItem) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider"
    >
      {label}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
      )}
    </button>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedItems.map((item, index) => (
        <div
          key={`${item.id}-${index}-grid`}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.brand}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(item.id)}
                className={`p-1 rounded-full hover:bg-gray-100 ${
                  item.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                }`}
              >
                <Star size={20} fill={item.isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => handleEditClick(item)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => deleteFoodItem(item.id)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-gray-600">Pack Weight</p>
              <p className="font-medium">{formatWeight(item.packWeight, unitSystem === 'imperial')}</p>
            </div>
            <div>
              <p className="text-gray-600">Calories/Pack</p>
              <p className="font-medium">{item.calories}</p>
            </div>
            <div>
              <p className="text-gray-600">Servings/Pack</p>
              <p className="font-medium">{item.servingsPerPack}</p>
            </div>
            <div>
              <p className="text-gray-600">Calories/Serving</p>
              <p className="font-medium">{item.caloriesPerServing}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {item.mealTypes.map((type) => (
              <span
                key={`${item.id}-${type}`}
                className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-3 text-left">
              <SortButton field="name" label="Name" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
            <th className="px-6 py-3 text-left">
              <SortButton field="weight" label="Weight" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cal/Pack</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servings</th>
            <th className="px-6 py-3 text-left">
              <SortButton field="caloriesPerServing" label="Cal/Serving" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredAndSortedItems.map((item, index) => (
            <tr key={`${item.id}-${index}-table`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.brand}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatWeight(item.packWeight, unitSystem === 'imperial')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.calories}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.servingsPerPack}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.caloriesPerServing}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex flex-wrap gap-1">
                  {item.mealTypes.map((type) => (
                    <span
                      key={`${item.id}-${type}-table`}
                      className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium"
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={`p-1 rounded-full hover:bg-gray-100 ${
                      item.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  >
                    <Star size={16} fill={item.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => handleEditClick(item)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteFoodItem(item.id)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Food Database</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TableIcon size={20} />
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={20} />
            Add Food Item
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
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
          value={selectedMealType}
          onChange={(e) => setSelectedMealType(e.target.value as MealType | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          {mealTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {viewMode === 'grid' ? <GridView /> : <TableView />}

      <FoodItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditItem(undefined);
        }}
        editItem={editItem}
      />
    </div>
  );
}