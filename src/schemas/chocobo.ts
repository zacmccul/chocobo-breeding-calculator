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
 * Schema for a single stat value (1-5 stars)
 */
export const StatValueSchema = z.number().int().min(1).max(5);

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
 * Count the number of locked stats (both father and mother have 5 stars)
 */
export function countLockedStats(chocobo: Chocobo): number {
  const stats = chocobo.stats;
  let locked = 0;
  
  if (stats.fatherMaxSpeed === 5 && stats.motherMaxSpeed === 5) locked++;
  if (stats.fatherAcceleration === 5 && stats.motherAcceleration === 5) locked++;
  if (stats.fatherEndurance === 5 && stats.motherEndurance === 5) locked++;
  if (stats.fatherStamina === 5 && stats.motherStamina === 5) locked++;
  if (stats.fatherCunning === 5 && stats.motherCunning === 5) locked++;
  
  return locked;
}

/**
 * Count the total number of stats with 5 stars (father or mother)
 */
export function countFiveStarStats(chocobo: Chocobo): number {
  const stats = chocobo.stats;
  let count = 0;
  
  if (stats.fatherMaxSpeed === 5) count++;
  if (stats.fatherAcceleration === 5) count++;
  if (stats.fatherEndurance === 5) count++;
  if (stats.fatherStamina === 5) count++;
  if (stats.fatherCunning === 5) count++;
  if (stats.motherMaxSpeed === 5) count++;
  if (stats.motherAcceleration === 5) count++;
  if (stats.motherEndurance === 5) count++;
  if (stats.motherStamina === 5) count++;
  if (stats.motherCunning === 5) count++;
  
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
