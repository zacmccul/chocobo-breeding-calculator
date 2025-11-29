import { z } from "zod";

/**
 * Enum for chocobo gender
 */
export const ChocoboGenderSchema = z.enum(["male", "female"]);
export type ChocoboGender = z.infer<typeof ChocoboGenderSchema>;

/**
 * Enum for chocobo abilities
 */
export const ChocoboAbilitySchema = z.enum([
  // Abilities with I, II, III variants
  "Choco Dash I",
  "Choco Dash II",
  "Choco Dash III",
  "Choco Cure I",
  "Choco Cure II",
  "Choco Cure III",
  "Choco Esuna I",
  "Choco Esuna II",
  "Choco Esuna III",
  "Choco Ease I",
  "Choco Ease II",
  "Choco Ease III",
  "Choco Calm I",
  "Choco Calm II",
  "Choco Calm III",
  "Choco Reflect I",
  "Choco Reflect II",
  "Choco Reflect III",
  "Choco Steal I",
  "Choco Steal II",
  "Choco Steal III",
  "Choco Silence I",
  "Choco Silence II",
  "Choco Silence III",
  "Choco Shock I",
  "Choco Shock II",
  "Choco Shock III",
  "Increased Stamina I",
  "Increased Stamina II",
  "Increased Stamina III",
  "Speedy Recovery I",
  "Speedy Recovery II",
  "Speedy Recovery III",
  "Dressage I",
  "Dressage II",
  "Dressage III",
  "Choco Drain I",
  "Choco Drain II",
  "Choco Drain III",
  "Mimic I",
  "Mimic II",
  "Mimic III",
  "Feather Field I",
  "Feather Field II",
  "Feather Field III",
  "Choco Reraise I",
  "Choco Reraise II",
  "Choco Reraise III",
  "Enfeeblement Clause I",
  "Enfeeblement Clause II",
  "Enfeeblement Clause III",
  "Breather I",
  "Breather II",
  "Breather III",
  // Abilities with I, II, III, IV, V variants
  "Heavy Resistance I",
  "Heavy Resistance II",
  "Heavy Resistance III",
  "Heavy Resistance IV",
  "Heavy Resistance V",
  "Level Head I",
  "Level Head II",
  "Level Head III",
  "Level Head IV",
  "Level Head V",
  // Unique abilities with no ranking
  "Super Sprint",
  "Paradigm Shift",
]).optional();
export type ChocoboAbility = z.infer<typeof ChocoboAbilitySchema>;

/**
 * Schema for a single stat value (1-4 stars)
 */
export const StatValueSchema = z.number().int().min(1).max(4);

/**
 * Schema for chocobo stats with both parent stats (blue/red)
 */
export const ChocoboStatsSchema = z.object({
  fatherMaxSpeed: StatValueSchema,
  fatherAcceleration: StatValueSchema,
  fatherEndurance: StatValueSchema,
  fatherStamina: StatValueSchema,
  fatherCunning: StatValueSchema,
  motherMaxSpeed: StatValueSchema,
  motherAcceleration: StatValueSchema,
  motherEndurance: StatValueSchema,
  motherStamina: StatValueSchema,
  motherCunning: StatValueSchema,
});

/**
 * Schema for a complete chocobo entry
 */
export const ChocoboSchema = z.object({
  id: z.string().uuid(),
  gender: ChocoboGenderSchema,
  name: z.string().optional(),
  grade: z.number().int().min(1).max(9).optional(),
  ability: ChocoboAbilitySchema,
  stats: ChocoboStatsSchema,
  coveringsLeft: z.number().int().min(0).max(10).default(9),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Chocobo = z.infer<typeof ChocoboSchema>;

/**
 * Schema for a list of chocobos
 */
export const ChocoboListSchema = z.array(ChocoboSchema);
export type ChocoboList = z.infer<typeof ChocoboListSchema>;

/**
 * Schema for export/import JSON format
 */
export const ChocoboExportSchema = z.object({
  version: z.literal("1.0"),
  exportedAt: z.string().datetime(),
  chocobos: ChocoboListSchema,
});

export type ChocoboExport = z.infer<typeof ChocoboExportSchema>;

/**
 * Simple UUID generator fallback
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Helper to create a default chocobo with minimum stats
 */
export function createDefaultChocobo(gender: ChocoboGender): Chocobo {
  return {
    id: generateUUID(),
    gender,
    stats: {
      fatherMaxSpeed: 1,
      fatherAcceleration: 1,
      fatherEndurance: 1,
      fatherStamina: 1,
      fatherCunning: 1,
      motherMaxSpeed: 1,
      motherAcceleration: 1,
      motherEndurance: 1,
      motherStamina: 1,
      motherCunning: 1,
    },
    coveringsLeft: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate total stat value for a chocobo (quality)
 */
export function calculateChocoboQuality(chocobo: Chocobo): number {
  const stats = chocobo.stats;
  return (
    stats.fatherMaxSpeed +
    stats.fatherAcceleration +
    stats.fatherEndurance +
    stats.fatherStamina +
    stats.fatherCunning +
    stats.motherMaxSpeed +
    stats.motherAcceleration +
    stats.motherEndurance +
    stats.motherStamina +
    stats.motherCunning
  );
}

/**
 * Count the number of locked stats (both father and mother have 4 stars)
 */
export function countLockedStats(chocobo: Chocobo): number {
  const stats = chocobo.stats;
  let locked = 0;
  
  if (stats.fatherMaxSpeed === 4 && stats.motherMaxSpeed === 4) locked++;
  if (stats.fatherAcceleration === 4 && stats.motherAcceleration === 4) locked++;
  if (stats.fatherEndurance === 4 && stats.motherEndurance === 4) locked++;
  if (stats.fatherStamina === 4 && stats.motherStamina === 4) locked++;
  if (stats.fatherCunning === 4 && stats.motherCunning === 4) locked++;
  
  return locked;
}

/**
 * Count the total number of stats with 4 stars (father or mother)
 */
export function countFourStarStats(chocobo: Chocobo): number {
  const stats = chocobo.stats;
  let count = 0;
  
  if (stats.fatherMaxSpeed === 4) count++;
  if (stats.fatherAcceleration === 4) count++;
  if (stats.fatherEndurance === 4) count++;
  if (stats.fatherStamina === 4) count++;
  if (stats.fatherCunning === 4) count++;
  if (stats.motherMaxSpeed === 4) count++;
  if (stats.motherAcceleration === 4) count++;
  if (stats.motherEndurance === 4) count++;
  if (stats.motherStamina === 4) count++;
  if (stats.motherCunning === 4) count++;
  
  return count;
}

/**
 * Validate and parse chocobo data
 */
export function validateChocobo(data: unknown): Chocobo {
  return ChocoboSchema.parse(data);
}

/**
 * Validate export data
 */
export function validateExport(data: unknown): ChocoboExport {
  return ChocoboExportSchema.parse(data);
}

/**
 * Migrate and cap stats at 4 for legacy data that may have 5-star stats.
 * Returns the migrated chocobo and whether any changes were made.
 */
export function migrateChocoboStats(chocobo: Chocobo): { chocobo: Chocobo; hadChanges: boolean } {
  let hadChanges = false;
  const stats = { ...chocobo.stats };
  
  // Cap all stats at 4
  if (stats.fatherMaxSpeed > 4) { stats.fatherMaxSpeed = 4; hadChanges = true; }
  if (stats.fatherAcceleration > 4) { stats.fatherAcceleration = 4; hadChanges = true; }
  if (stats.fatherEndurance > 4) { stats.fatherEndurance = 4; hadChanges = true; }
  if (stats.fatherStamina > 4) { stats.fatherStamina = 4; hadChanges = true; }
  if (stats.fatherCunning > 4) { stats.fatherCunning = 4; hadChanges = true; }
  if (stats.motherMaxSpeed > 4) { stats.motherMaxSpeed = 4; hadChanges = true; }
  if (stats.motherAcceleration > 4) { stats.motherAcceleration = 4; hadChanges = true; }
  if (stats.motherEndurance > 4) { stats.motherEndurance = 4; hadChanges = true; }
  if (stats.motherStamina > 4) { stats.motherStamina = 4; hadChanges = true; }
  if (stats.motherCunning > 4) { stats.motherCunning = 4; hadChanges = true; }
  
  return {
    chocobo: hadChanges ? { ...chocobo, stats, updatedAt: new Date().toISOString() } : chocobo,
    hadChanges
  };
}
