import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UnitSystem = 'metric' | 'imperial';

interface SettingsStore {
  unitSystem: UnitSystem;
  toggleUnitSystem: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      unitSystem: 'metric',
      toggleUnitSystem: () =>
        set((state) => ({
          unitSystem: state.unitSystem === 'metric' ? 'imperial' : 'metric',
        })),
    }),
    {
      name: 'trail-kitchen-settings',
    }
  )
);