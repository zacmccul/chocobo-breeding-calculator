import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Chocobo, ChocoboGender, ChocoboAbility } from "../schemas/chocobo";
import {
  createDefaultChocobo,
  validateChocobo,
  validateExport,
  calculateChocoboQuality,
} from "../schemas/chocobo";
import { evaluateBreedingPair } from "../utils/breeding";
import type { ChocoboParentDataParsed } from "../utils/breeding";

export interface OptimalPairResult {
  father: Chocobo;
  mother: Chocobo;
  score: number;
}

interface AbilityFilter {
  ability: ChocoboAbility;
  minCount: number;
}

interface ChocoboStore {
  chocobos: Chocobo[];
  optimalPair: OptimalPairResult | null;
  abilityFilters: AbilityFilter[];

  // Actions
  addChocobo: (gender: ChocoboGender) => void;
  removeChocobo: (id: string) => void;
  updateChocobo: (id: string, updates: Partial<Chocobo>) => void;
  updateChocoboStats: (id: string, stats: Partial<Chocobo["stats"]>) => void;
  findOptimalBreedingPair: () => void;
  clearOptimalPair: () => void;
  exportData: () => string;
  importData: (jsonString: string) => void;
  addAbilityFilter: (filter: AbilityFilter) => void;
  removeAbilityFilter: (index: number) => void;
  clearAllFilters: () => void;
  getFilteredChocobos: () => Chocobo[];
  getMaleChocobos: () => Chocobo[];
  getFemaleChocobos: () => Chocobo[];
  getSortedMales: () => Chocobo[];
  getSortedFemales: () => Chocobo[];
}

/**
 * Convert Chocobo format to ChocoboParentDataParsed format for breeding calculations
 */
function convertToParentDataParsed(chocobo: Chocobo): ChocoboParentDataParsed {
  return {
    gender: chocobo.gender,
    coveringsLeft: chocobo.coveringsLeft,
    fatherMaxSpeed: chocobo.stats.fatherMaxSpeed,
    fatherAcceleration: chocobo.stats.fatherAcceleration,
    fatherEndurance: chocobo.stats.fatherEndurance,
    fatherStamina: chocobo.stats.fatherStamina,
    fatherCunning: chocobo.stats.fatherCunning,
    motherMaxSpeed: chocobo.stats.motherMaxSpeed,
    motherAcceleration: chocobo.stats.motherAcceleration,
    motherEndurance: chocobo.stats.motherEndurance,
    motherStamina: chocobo.stats.motherStamina,
    motherCunning: chocobo.stats.motherCunning,
  };
}

export const useChocoboStore = create<ChocoboStore>()(
  persist(
    (set, get) => ({
      chocobos: [],
      optimalPair: null,
      abilityFilters: [],

      addChocobo: (gender: ChocoboGender) => {
        const newChocobo = createDefaultChocobo(gender);
        set((state) => ({
          chocobos: [...state.chocobos, newChocobo],
        }));
      },

      removeChocobo: (id: string) => {
        set((state) => ({
          chocobos: state.chocobos.filter((c) => c.id !== id),
          optimalPair:
            state.optimalPair?.father.id === id || state.optimalPair?.mother.id === id
              ? null
              : state.optimalPair,
        }));
      },

      updateChocobo: (id: string, updates: Partial<Chocobo>) => {
        set((state) => ({
          chocobos: state.chocobos.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }));
      },

      updateChocoboStats: (id: string, stats: Partial<Chocobo["stats"]>) => {
        set((state) => ({
          chocobos: state.chocobos.map((c) =>
            c.id === id
              ? {
                  ...c,
                  stats: { ...c.stats, ...stats },
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }));
      },

      findOptimalBreedingPair: () => {
        const chocobos = get().chocobos;
        
        // Separate males and females
        const males = chocobos.filter(c => c.gender === "male");
        const females = chocobos.filter(c => c.gender === "female");
        
        // Need at least one male and one female
        if (males.length === 0 || females.length === 0) {
          set({ optimalPair: null });
          return;
        }
        
        let bestPair: { father: Chocobo; mother: Chocobo; score: number } | null = null;
        let bestScore = -Infinity;
        
        // Evaluate all possible pairings
        for (const male of males) {
          const maleData = convertToParentDataParsed(male);
          
          for (const female of females) {
            const femaleData = convertToParentDataParsed(female);
            
            // Use evaluateBreedingPair to get expected rank score (higher is better)
            const score = evaluateBreedingPair(maleData, femaleData, false);
            
            if (score > bestScore) {
              bestScore = score;
              bestPair = {
                father: male,
                mother: female,
                score,
              };
            }
          }
        }
        
        set({ optimalPair: bestPair });
      },

      clearOptimalPair: () => {
        set({ optimalPair: null });
      },

      exportData: () => {
        const state = get();
        const exportData = {
          version: "1.0" as const,
          exportedAt: new Date().toISOString(),
          chocobos: state.chocobos,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importData: (jsonString: string) => {
        try {
          const data = JSON.parse(jsonString);
          const validated = validateExport(data);
          
          // Validate each chocobo individually
          const validatedChocobos = validated.chocobos.map((c) => validateChocobo(c));

          set({
            chocobos: validatedChocobos,
            optimalPair: null,
          });
        } catch (error) {
          throw new Error(
            `Failed to import data: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      },

      addAbilityFilter: (filter: AbilityFilter) => {
        set((state) => ({
          abilityFilters: [...state.abilityFilters, filter],
        }));
      },

      removeAbilityFilter: (index: number) => {
        set((state) => ({
          abilityFilters: state.abilityFilters.filter((_, i) => i !== index),
        }));
      },

      clearAllFilters: () => {
        set({ abilityFilters: [] });
      },

      getFilteredChocobos: () => {
        const { chocobos, abilityFilters } = get();
        
        if (abilityFilters.length === 0) {
          return chocobos;
        }

        return chocobos.filter((chocobo) => {
          return abilityFilters.every((filter) => {
            // If chocobo doesn't have an ability, it doesn't match
            if (!chocobo.ability) return false;
            
            // For now, we just check if the ability matches
            // The minCount feature would require tracking multiple chocobos
            return chocobo.ability === filter.ability;
          });
        });
      },

      getMaleChocobos: () => {
        return get().chocobos.filter((c) => c.gender === "male");
      },

      getFemaleChocobos: () => {
        return get().chocobos.filter((c) => c.gender === "female");
      },

      getSortedMales: () => {
        return get()
          .getMaleChocobos()
          .sort((a, b) => calculateChocoboQuality(b) - calculateChocoboQuality(a));
      },

      getSortedFemales: () => {
        return get()
          .getFemaleChocobos()
          .sort((a, b) => calculateChocoboQuality(b) - calculateChocoboQuality(a));
      },
    }),
    {
      name: "chocobo-storage",
      version: 1,
    }
  )
);
