import React from 'react';
import { Scale } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export function UnitToggle() {
  const { unitSystem, toggleUnitSystem } = useSettingsStore();

  return (
    <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm p-1">
      <button
        onClick={() => unitSystem !== 'metric' && toggleUnitSystem()}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          unitSystem === 'metric'
            ? 'bg-emerald-100 text-emerald-700'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Scale size={18} />
        Metric
      </button>
      <button
        onClick={() => unitSystem !== 'imperial' && toggleUnitSystem()}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          unitSystem === 'imperial'
            ? 'bg-emerald-100 text-emerald-700'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Scale size={18} />
        Imperial
      </button>
    </div>
  );
}