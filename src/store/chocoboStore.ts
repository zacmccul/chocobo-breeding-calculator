import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Chocobo, ChocoboGender } from "../schemas/chocobo";
import {
  createDefaultChocobo,
  validateChocobo,
  validateExport,
  calculateChocoboQuality,
  countLockedStats,
  countFourStarStats,
  migrateChocoboStats,
} from "../schemas/chocobo";
import { evaluateBreedingPair } from "../utils/breeding";
import type { ChocoboParentDataParsed } from "../utils/breeding";

export interface OptimalPairResult {
  father: Chocobo;
  mother: Chocobo;
  score: number;
}

export type StatName = "maxSpeed" | "acceleration" | "endurance" | "stamina" | "cunning";
export type StatParent = "one" | "all";
export type FilterType = "stat" | "grade" | "ability" | "name";

// Base filter interface
interface BaseFilter {
  id: string;
  type: FilterType;
}

// Stat filter
export interface StatFilterData extends BaseFilter {
  type: "stat";
  stat: StatName;
  parent: StatParent;
  minValue: number; // 1-5
}

// Grade filter
export interface GradeFilterData extends BaseFilter {
  type: "grade";
  minValue: number; // 1-9
}

// Ability filter (including "None" as a special case)
export interface AbilityFilterData extends BaseFilter {
  type: "ability";
  ability: string; // Can be an ability name or "None"
}

// Name filter
export interface NameFilterData extends BaseFilter {
  type: "name";
  searchQuery: string;
}

// Union type for all filters
export type StatFilter = StatFilterData | GradeFilterData | AbilityFilterData | NameFilterData;

export type SortType = "quality" | "locked" | "fiveStars";
export type SortOrder = "asc" | "desc";

interface ChocoboStore {
  chocobos: Chocobo[];
  optimalPair: OptimalPairResult | null;
  statFilters: StatFilter[];
  sortType: SortType;
  sortOrder: SortOrder;
  isEditMode: boolean;
  frozenMaleSortOrder: string[];
  frozenFemaleSortOrder: string[];
  frozenFilteredIds: string[];
  pendingChangesWhileEditing: boolean;
  hasSeenInfo: boolean;
  superSprint: boolean;

  // Actions
  addChocobo: (gender: ChocoboGender) => void;
  removeChocobo: (id: string) => void;
  updateChocobo: (id: string, updates: Partial<Chocobo>) => void;
  updateChocoboStats: (id: string, stats: Partial<Chocobo["stats"]>) => void;
  findOptimalBreedingPair: () => void;
  clearOptimalPair: () => void;
  breedOptimalPair: () => void;
  exportData: () => string;
  importData: (jsonString: string) => boolean;
  addStatFilter: (filter: Omit<StatFilter, "id">) => void;
  removeStatFilter: (id: string) => void;
  clearAllFilters: () => void;
  setSortType: (sortType: SortType) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setEditMode: (isEditMode: boolean) => void;
  setHasSeenInfo: (hasSeen: boolean) => void;
  setSuperSprint: (superSprint: boolean) => void;
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

/**
 * Sort chocobos based on the selected sort type and order
 */
function sortChocobos(chocobos: Chocobo[], sortType: SortType, sortOrder: SortOrder): Chocobo[] {
  const sorted = [...chocobos].sort((a, b) => {
    let valueA: number;
    let valueB: number;
    
    switch (sortType) {
      case "quality":
        valueA = calculateChocoboQuality(a);
        valueB = calculateChocoboQuality(b);
        break;
      case "locked":
        valueA = countLockedStats(a);
        valueB = countLockedStats(b);
        break;
      case "fiveStars":
        valueA = countFourStarStats(a);
        valueB = countFourStarStats(b);
        break;
      default:
        valueA = calculateChocoboQuality(a);
        valueB = calculateChocoboQuality(b);
    }
    
    return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
  });
  
  return sorted;
}

export const useChocoboStore = create<ChocoboStore>()(
  persist(
    (set, get) => ({
      chocobos: [],
      optimalPair: null,
      statFilters: [],
      sortType: "quality" as SortType,
      sortOrder: "desc" as SortOrder,
      isEditMode: false,
      frozenMaleSortOrder: [],
      frozenFemaleSortOrder: [],
      frozenFilteredIds: [],
      pendingChangesWhileEditing: false,
      hasSeenInfo: false,
      superSprint: false,

      addChocobo: (gender: ChocoboGender) => {
        const newChocobo = createDefaultChocobo(gender);
        set((state) => {
          // If in edit mode, add the new chocobo to the top of the frozen lists
          if (state.isEditMode) {
            return {
              chocobos: [...state.chocobos, newChocobo],
              frozenMaleSortOrder: gender === "male" 
                ? [newChocobo.id, ...state.frozenMaleSortOrder]
                : state.frozenMaleSortOrder,
              frozenFemaleSortOrder: gender === "female"
                ? [newChocobo.id, ...state.frozenFemaleSortOrder]
                : state.frozenFemaleSortOrder,
              frozenFilteredIds: [newChocobo.id, ...state.frozenFilteredIds],
            };
          }
          
          // Not in edit mode, just add the chocobo normally
          return {
            chocobos: [...state.chocobos, newChocobo],
          };
        });
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
        console.log('🐤 [Breeding] Starting optimal pair calculation...');
        
        const chocobos = get().getFilteredChocobos();
        console.log(`🐤 [Breeding] Filtered chocobos: ${chocobos.length} total`);
        
        // Separate males and females
        const males = chocobos.filter(c => c.gender === "male");
        const females = chocobos.filter(c => c.gender === "female");
        
        console.log(`🐤 [Breeding] Males: ${males.length}, Females: ${females.length}`);
        
        // Need at least one male and one female
        if (males.length === 0 || females.length === 0) {
          console.log('🐤 [Breeding] ❌ Not enough chocobos to breed (need at least 1 male and 1 female)');
          set({ optimalPair: null });
          return;
        }
        
        let bestPair: { father: Chocobo; mother: Chocobo; score: number } | null = null;
        let bestScore = -Infinity;
        
        console.log(`🐤 [Breeding] Evaluating ${males.length * females.length} possible pairings...`);
        console.log(`🐤 [Breeding] Super Sprint mode: ${get().superSprint}`);
        
        // Evaluate all possible pairings
        for (const male of males) {
          const maleData = convertToParentDataParsed(male);
          
          for (const female of females) {
            const femaleData = convertToParentDataParsed(female);
            
            // Use evaluateBreedingPair to get expected quality percentage (higher is better)
            const score = evaluateBreedingPair(maleData, femaleData, get().superSprint);
            
            console.log(`🐤 [Breeding] Pair: ${male.name || male.id.slice(0,8)} (M) + ${female.name || female.id.slice(0,8)} (F) = Quality: ${score.toFixed(2)}%`);
            
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
        
        if (bestPair) {
          console.log(`🐤 [Breeding] ✅ Best pair found!`);
          console.log(`🐤 [Breeding] Father: ${bestPair.father.name || bestPair.father.id}`);
          console.log(`🐤 [Breeding] Mother: ${bestPair.mother.name || bestPair.mother.id}`);
          console.log(`🐤 [Breeding] Quality: ${bestPair.score.toFixed(2)}%`);
        } else {
          console.log('🐤 [Breeding] ❌ No valid pair found');
        }
        
        set({ optimalPair: bestPair });
      },

      clearOptimalPair: () => {
        set({ optimalPair: null });
      },

      breedOptimalPair: () => {
        const { optimalPair } = get();
        if (!optimalPair) return;

        const fatherId = optimalPair.father.id;
        const motherId = optimalPair.mother.id;

        set((state) => {
          const updatedChocobos = state.chocobos.map((c) => {
            if (c.id === fatherId || c.id === motherId) {
              return {
                ...c,
                coveringsLeft: Math.max(0, c.coveringsLeft - 1),
                updatedAt: new Date().toISOString(),
              };
            }
            return c;
          });

          // Update the optimal pair with the new coverings left
          const updatedFather = updatedChocobos.find(c => c.id === fatherId);
          const updatedMother = updatedChocobos.find(c => c.id === motherId);

          return {
            chocobos: updatedChocobos,
            optimalPair: updatedFather && updatedMother ? {
              ...state.optimalPair!,
              father: updatedFather,
              mother: updatedMother,
            } : state.optimalPair,
          };
        });
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
          
          // Validate and migrate each chocobo individually
          let hadAnyChanges = false;
          const validatedChocobos = validated.chocobos.map((c) => {
            const validatedChocobo = validateChocobo(c);
            const { chocobo: migratedChocobo, hadChanges } = migrateChocoboStats(validatedChocobo);
            if (hadChanges) hadAnyChanges = true;
            return migratedChocobo;
          });

          set({
            chocobos: validatedChocobos,
            optimalPair: null,
          });
          
          // Return whether migration occurred so caller can show toast
          return hadAnyChanges;
        } catch (error) {
          throw new Error(
            `Failed to import data: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      },

      addStatFilter: (filter: Omit<StatFilter, "id">) => {
        const newFilter: StatFilter = {
          ...filter,
          id: `filter-${Date.now()}-${Math.random()}`,
        } as StatFilter;
        set((state) => ({
          statFilters: [...state.statFilters, newFilter],
          pendingChangesWhileEditing: state.isEditMode || state.pendingChangesWhileEditing,
        }));
      },

      removeStatFilter: (id: string) => {
        set((state) => ({
          statFilters: state.statFilters.filter((f) => f.id !== id),
          pendingChangesWhileEditing: state.isEditMode || state.pendingChangesWhileEditing,
        }));
      },

      clearAllFilters: () => {
        set((state) => ({
          statFilters: [],
          pendingChangesWhileEditing: state.isEditMode || state.pendingChangesWhileEditing,
        }));
      },

      setSortType: (sortType: SortType) => {
        set((state) => ({
          sortType,
          pendingChangesWhileEditing: state.isEditMode || state.pendingChangesWhileEditing,
        }));
      },

      setSortOrder: (sortOrder: SortOrder) => {
        set((state) => ({
          sortOrder,
          pendingChangesWhileEditing: state.isEditMode || state.pendingChangesWhileEditing,
        }));
      },

      setEditMode: (isEditMode: boolean) => {
        if (isEditMode) {
          // Entering edit mode - freeze current sort order and filtered chocobos
          const males = get().getSortedMales();
          const females = get().getSortedFemales();
          const filtered = get().getFilteredChocobos();
          set({
            isEditMode,
            frozenMaleSortOrder: males.map(c => c.id),
            frozenFemaleSortOrder: females.map(c => c.id),
            frozenFilteredIds: filtered.map(c => c.id),
          });
        } else {
          // Exiting edit mode - clear frozen order, filters, and pending changes flag
          set({
            isEditMode,
            frozenMaleSortOrder: [],
            frozenFemaleSortOrder: [],
            frozenFilteredIds: [],
            pendingChangesWhileEditing: false,
          });
        }
      },

      setHasSeenInfo: (hasSeen: boolean) => {
        set({ hasSeenInfo: hasSeen });
      },

      setSuperSprint: (superSprint: boolean) => {
        set({ superSprint });
      },

      getFilteredChocobos: () => {
        const { chocobos, statFilters, isEditMode, frozenFilteredIds } = get();
        
        // If in edit mode, use frozen filtered list to prevent chocobos from disappearing mid-edit
        if (isEditMode && frozenFilteredIds.length > 0) {
          return chocobos.filter(c => frozenFilteredIds.includes(c.id));
        }
        
        if (statFilters.length === 0) {
          return chocobos;
        }

        return chocobos.filter((chocobo) => {
          return statFilters.every((filter) => {
            // Handle different filter types
            if (filter.type === 'stat') {
              const { stat, parent, minValue } = filter;
              
              // Map stat name to chocobo stat properties
              const statMap: Record<StatName, { father: keyof typeof chocobo.stats; mother: keyof typeof chocobo.stats }> = {
                maxSpeed: { father: 'fatherMaxSpeed', mother: 'motherMaxSpeed' },
                acceleration: { father: 'fatherAcceleration', mother: 'motherAcceleration' },
                endurance: { father: 'fatherEndurance', mother: 'motherEndurance' },
                stamina: { father: 'fatherStamina', mother: 'motherStamina' },
                cunning: { father: 'fatherCunning', mother: 'motherCunning' },
              };
              
              const fatherStat = chocobo.stats[statMap[stat].father];
              const motherStat = chocobo.stats[statMap[stat].mother];
              
              if (parent === 'one') {
                // At least one parent meets the requirement
                return fatherStat >= minValue || motherStat >= minValue;
              } else { // all
                // Both parents meet the requirement
                return fatherStat >= minValue && motherStat >= minValue;
              }
            } else if (filter.type === 'grade') {
              // Grade filter - check if chocobo grade meets minimum
              if (chocobo.grade === undefined) return false;
              return chocobo.grade >= filter.minValue;
            } else if (filter.type === 'ability') {
              // Ability filter - exact match or check for "None"
              if (filter.ability === 'None') {
                return chocobo.ability === undefined;
              }
              return chocobo.ability === filter.ability;
            } else if (filter.type === 'name') {
              // Name filter - lowercase stripped comparison (contains)
              if (!chocobo.name) return false;
              const normalizedName = chocobo.name.toLowerCase().replace(/\s+/g, '');
              const normalizedQuery = filter.searchQuery.toLowerCase().replace(/\s+/g, '');
              return normalizedName.includes(normalizedQuery);
            }
            return true;
          });
        });
      },

      getMaleChocobos: () => {
        return get().getFilteredChocobos().filter((c) => c.gender === "male");
      },

      getFemaleChocobos: () => {
        return get().getFilteredChocobos().filter((c) => c.gender === "female");
      },

      getSortedMales: () => {
        const { sortType, sortOrder, isEditMode, frozenMaleSortOrder } = get();
        const males = get().getMaleChocobos();
        
        if (isEditMode && frozenMaleSortOrder.length > 0) {
          // Use frozen sort order
          const sorted = [...males].sort((a, b) => {
            const indexA = frozenMaleSortOrder.indexOf(a.id);
            const indexB = frozenMaleSortOrder.indexOf(b.id);
            // Put new chocobos (not in frozen list) at the end
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          return sorted;
        }
        
        return sortChocobos(males, sortType, sortOrder);
      },

      getSortedFemales: () => {
        const { sortType, sortOrder, isEditMode, frozenFemaleSortOrder } = get();
        const females = get().getFemaleChocobos();
        
        if (isEditMode && frozenFemaleSortOrder.length > 0) {
          // Use frozen sort order
          const sorted = [...females].sort((a, b) => {
            const indexA = frozenFemaleSortOrder.indexOf(a.id);
            const indexB = frozenFemaleSortOrder.indexOf(b.id);
            // Put new chocobos (not in frozen list) at the end
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          return sorted;
        }
        
        return sortChocobos(females, sortType, sortOrder);
      },
    }),
    {
      name: "chocobo-storage",
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Migrate all chocobos in storage to ensure they have valid 4-star max stats
          let hadLegacyData = false;
          const migratedChocobos = state.chocobos.map((chocobo) => {
            const { chocobo: migratedChocobo, hadChanges } = migrateChocoboStats(chocobo);
            if (hadChanges) {
              hadLegacyData = true;
            }
            return migratedChocobo;
          });
          
          if (hadLegacyData) {
            state.chocobos = migratedChocobos;
            
            // Show toast notification to user
            import("../ui/toaster").then(({ toaster }) => {
              toaster.create({
                title: "Data Migrated",
                description: "Your saved chocobos had stats above 4 stars and were automatically capped to 4 stars.",
                type: "warning",
                duration: 5000,
              });
            });
          }
        }
      },
    }
  )
);
