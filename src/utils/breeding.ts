/**
 * Core breeding calculation utilities for FFXIV Chocobo Breeding
 * 
 * Key mechanic: A chocobo's own racing stars don't matter for breeding.
 * Only the parent stats (father/mother stats) are used for breeding.
 * When two chocobos breed, the offspring randomly inherits one stat from each parent's parents.
 */


export interface ChocoboStats {
  maxSpeed: number;
  acceleration: number;
  endurance: number;
  stamina: number;
  cunning: number;
}

export interface ChocoboParentData {
  gender: string;
  fatherMaxSpeed: string;
  fatherAcceleration: string;
  fatherEndurance: string;
  fatherStamina: string;
  fatherCunning: string;
  motherMaxSpeed: string;
  motherAcceleration: string;
  motherEndurance: string;
  motherStamina: string;
  motherCunning: string;
}

export interface ChocoboParentDataParsed {
    gender: string;
    coveringsLeft: number;
    fatherMaxSpeed: number;
    fatherAcceleration: number;
    fatherEndurance: number;
    fatherStamina: number;
    fatherCunning: number;
    motherMaxSpeed: number;
    motherAcceleration: number;
    motherEndurance: number;
    motherStamina: number;
    motherCunning: number;
}

/**
 * Orders two chocobos by the following criteria, using each successive tiebreaker:
 *   1. The most number of stats that contain at least 1 four-star.
 *   2. The most number of stats that are locked, i.e. contain only 4 stars.
 *   3. If not superSprint, Maximize the following equality: Max Speed + Stamina - Cunning - Acceleration, followed by tiebreaker on maxing endurance.
 *   4. If superSprint, Maximize the following equality: Stamina + Endurance - Cunning - Acceleration, followed by tiebreaker on maxing max speed.
 *  
 * @param a 
 * @param b 
 */
export function orderChocobo(a: ChocoboParentDataParsed, b: ChocoboParentDataParsed, superSprint: boolean = false): number {
  // Helper to get all stats for a chocobo
  const getStats = (chocobo: ChocoboParentDataParsed) => [
    [chocobo.fatherMaxSpeed, chocobo.motherMaxSpeed],
    [chocobo.fatherAcceleration, chocobo.motherAcceleration],
    [chocobo.fatherEndurance, chocobo.motherEndurance],
    [chocobo.fatherStamina, chocobo.motherStamina],
    [chocobo.fatherCunning, chocobo.motherCunning],
  ];

  const statsA = getStats(a);
  const statsB = getStats(b);

  // Criterion 1: Count stats that contain at least one 4
  const countWithFour = (stats: number[][]) => 
    stats.filter(([father, mother]) => father === 4 || mother === 4).length;
  
  const aWithFour = countWithFour(statsA);
  const bWithFour = countWithFour(statsB);
  
  if (aWithFour !== bWithFour) {
    return bWithFour - aWithFour; // More 4s is better, so b > a means negative (b comes first)
  }

  // Criterion 2: Count locked stats (both father and mother are 4)
  const countLocked = (stats: number[][]) => 
    stats.filter(([father, mother]) => father === 4 && mother === 4).length;
  
  const aLocked = countLocked(statsA);
  const bLocked = countLocked(statsB);
  
  if (aLocked !== bLocked) {
    return bLocked - aLocked;
  }

  // Get individual stat averages for criteria 3 & 4
  const getStatAvg = (chocobo: ChocoboParentDataParsed, statName: string) => {
    const father = chocobo[`father${statName}` as keyof ChocoboParentDataParsed] as number;
    const mother = chocobo[`mother${statName}` as keyof ChocoboParentDataParsed] as number;
    return (father + mother) / 2;
  };

  if (!superSprint) {
    // Criterion 3: Max Speed + Stamina - Cunning - Acceleration
    const calcFormula3 = (chocobo: ChocoboParentDataParsed) => 
      getStatAvg(chocobo, 'MaxSpeed') + 
      getStatAvg(chocobo, 'Stamina') - 
      getStatAvg(chocobo, 'Cunning') - 
      getStatAvg(chocobo, 'Acceleration');
    
    const aFormula = calcFormula3(a);
    const bFormula = calcFormula3(b);
    
    if (aFormula !== bFormula) {
      return bFormula - aFormula;
    }
    
    // Tiebreaker: max endurance
    const aEndurance = getStatAvg(a, 'Endurance');
    const bEndurance = getStatAvg(b, 'Endurance');
    
    return bEndurance - aEndurance;
  } else {
    // Criterion 4: Stamina + Endurance - Cunning - Acceleration
    const calcFormula4 = (chocobo: ChocoboParentDataParsed) => 
      getStatAvg(chocobo, 'Stamina') + 
      getStatAvg(chocobo, 'Endurance') - 
      getStatAvg(chocobo, 'Cunning') - 
      getStatAvg(chocobo, 'Acceleration');
    
    const aFormula = calcFormula4(a);
    const bFormula = calcFormula4(b);
    
    if (aFormula !== bFormula) {
      return bFormula - aFormula;
    }
    
    // Tiebreaker: max speed
    const aMaxSpeed = getStatAvg(a, 'MaxSpeed');
    const bMaxSpeed = getStatAvg(b, 'MaxSpeed');
    
    return bMaxSpeed - aMaxSpeed;
  }
}

/**
 * Represents the breeding potential for a single stat.
 * Contains the best, worst, and average values that offspring can inherit.
 */
export interface StatPotential {
  best: number;      // Best possible value from both parents
  worst: number;     // Worst possible value from both parents
  average: number;   // Average of all possible combinations
  hasPerfect: boolean; // True if both parent values are max (4)
}

/**
 * Evaluate the breeding potential of a pair for a single stat.
 * In FFXIV, offspring inherit one stat from each parent's parents randomly.
 */
export function evaluateStatPotential(
  maleFatherStat: number,
  maleMotherStat: number,
  femaleFatherStat: number,
  femaleMotherStat: number
): StatPotential {
  // Offspring will inherit one stat from male side (maleFather or maleMother) 
  // and one from female side (femaleFather or femaleMother)
  const possibleValues = [maleFatherStat, maleMotherStat, femaleFatherStat, femaleMotherStat];
  
  const best = Math.max(...possibleValues);
  const worst = Math.min(...possibleValues);
  const average = possibleValues.reduce((a, b) => a + b, 0) / possibleValues.length;
  
  // Perfect inheritance: all four grandparent stats are 4
  const hasPerfect = possibleValues.every(v => v === 4);

  return { best, worst, average, hasPerfect };
}

/**
 * Calculate overall breeding quality score for a pair.
 * Higher score = better breeding potential toward all 4-star offspring.
 */
export function calculateBreedingScore(
  male: ChocoboParentData,
  female: ChocoboParentData
): number {
  const stats = [
    { m: [parseInt(male.fatherMaxSpeed), parseInt(male.motherMaxSpeed)],
      f: [parseInt(female.fatherMaxSpeed), parseInt(female.motherMaxSpeed)] },
    { m: [parseInt(male.fatherAcceleration), parseInt(male.motherAcceleration)],
      f: [parseInt(female.fatherAcceleration), parseInt(female.motherAcceleration)] },
    { m: [parseInt(male.fatherEndurance), parseInt(male.motherEndurance)],
      f: [parseInt(female.fatherEndurance), parseInt(female.motherEndurance)] },
    { m: [parseInt(male.fatherStamina), parseInt(male.motherStamina)],
      f: [parseInt(female.fatherStamina), parseInt(female.motherStamina)] },
    { m: [parseInt(male.fatherCunning), parseInt(male.motherCunning)],
      f: [parseInt(female.fatherCunning), parseInt(female.motherCunning)] },
  ];

  let totalScore = 0;

  stats.forEach((stat) => {
    const potential = evaluateStatPotential(
      stat.m[0], // male father
      stat.m[1], // male mother
      stat.f[0], // female father
      stat.f[1]  // female mother
    );

    // Scoring criteria:
    // 1. Perfect stats (all 4) are most valuable: +100 points
    // 2. Best possible outcome: +20 * best value
    // 3. Average potential: +10 * average
    // 4. Penalty for worst case: -5 * (4 - worst)
    
    let statScore = 0;
    
    if (potential.hasPerfect) {
      statScore += 100; // Guaranteed 4-star inheritance
    } else {
      statScore += potential.best * 20;     // Reward high ceiling
      statScore += potential.average * 10;   // Reward good average
      statScore -= (4 - potential.worst) * 5; // Penalize low floor
    }

    totalScore += statScore;
  });

  return totalScore;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use evaluateStatPotential instead
 */
export function calculateBird(birdObject: ChocoboParentData): ChocoboStats {
  const returnObject: ChocoboStats = {
    maxSpeed: 0,
    acceleration: 0,
    endurance: 0,
    stamina: 0,
    cunning: 0,
  };

  const listOfNames: Array<[keyof ChocoboParentData, keyof ChocoboParentData, keyof ChocoboStats]> = [
    ["fatherMaxSpeed", "motherMaxSpeed", "maxSpeed"],
    ["fatherAcceleration", "motherAcceleration", "acceleration"],
    ["fatherEndurance", "motherEndurance", "endurance"],
    ["fatherStamina", "motherStamina", "stamina"],
    ["fatherCunning", "motherCunning", "cunning"],
  ];

  listOfNames.forEach((elem) => {
    const fatherStat = parseInt(birdObject[elem[0]] as string);
    const motherStat = parseInt(birdObject[elem[1]] as string);
    
    returnObject[elem[2]] = (fatherStat + motherStat) / 12;
  });

  return returnObject;
}

/**
 * Add two stat objects together
 * @deprecated Use calculateBreedingScore instead
 */
export function addObjects(obj1: ChocoboStats, obj2: ChocoboStats): ChocoboStats {
  const returnObject: ChocoboStats = {
    maxSpeed: 0,
    acceleration: 0,
    endurance: 0,
    stamina: 0,
    cunning: 0,
  };

  (Object.keys(obj1) as Array<keyof ChocoboStats>).forEach((key) => {
    returnObject[key] = obj1[key] + obj2[key];
  });

  return returnObject;
}

/**
 * Calculate the total score of a chocobo's stats
 * @deprecated Use calculateBreedingScore instead
 */
export function calculateScore(stats: ChocoboStats): number {
  let total = 0;
  (Object.keys(stats) as Array<keyof ChocoboStats>).forEach((key) => {
    total += stats[key];
  });
  return parseFloat(total.toFixed(3));
}

/**
 * Compare two breeding pairs by their breeding score
 */
export function compareBirds(
  a: { score: number },
  b: { score: number }
): number {
  return b.score - a.score; // Higher score is better
}

/**
 * Generate all possible combinations (Cartesian product) of arrays
 */
function cartesianProduct<T>(...arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  if (arrays.length === 1) return arrays[0].map(item => [item]);
  
  const [first, ...rest] = arrays;
  const restProduct = cartesianProduct(...rest);
  
  return first.flatMap(item =>
    restProduct.map(combo => [item, ...combo])
  );
}

/**
 * Calculate the maximum possible quality score for a perfect chocobo.
 * This represents a chocobo with all stats at [4, 4].
 */
function calculateMaxPossibleScore(superSprint: boolean = false): number {
  // Perfect stats: all 4s
  const perfectStats: Array<[number, number]> = [
    [4, 4], [4, 4], [4, 4], [4, 4], [4, 4]
  ];
  return calculateChocoboQualityScore(perfectStats, superSprint);
}

/**
 * Calculate a numeric quality score for a chocobo based on its stats.
 * Higher score = better chocobo according to our ordering criteria.
 * 
 * This converts our multi-criteria ordering into a single comparable number.
 */
function calculateChocoboQualityScore(stats: Array<[number, number]>, superSprint: boolean = false): number {
  // Criterion 1: Count stats that contain at least one 4 (most important)
  const countWithFour = stats.filter(([father, mother]) => father === 4 || mother === 4).length;
  
  // Criterion 2: Count locked stats (both father and mother are 4)
  const countLocked = stats.filter(([father, mother]) => father === 4 && mother === 4).length;
  
  // Get individual stat averages
  const getStatAvg = (index: number) => {
    const [father, mother] = stats[index];
    return (father + mother) / 2;
  };
  
  // Stat indices: 0=MaxSpeed, 1=Acceleration, 2=Endurance, 3=Stamina, 4=Cunning
  let formula: number;
  let tiebreaker: number;
  
  if (!superSprint) {
    // Criterion 3: Max Speed + Stamina - Cunning - Acceleration
    formula = getStatAvg(0) + getStatAvg(3) - getStatAvg(4) - getStatAvg(1);
    // Tiebreaker: max endurance
    tiebreaker = getStatAvg(2);
  } else {
    // Criterion 4: Stamina + Endurance - Cunning - Acceleration
    formula = getStatAvg(3) + getStatAvg(2) - getStatAvg(4) - getStatAvg(1);
    // Tiebreaker: max speed
    tiebreaker = getStatAvg(0);
  }
  
  // Combine all criteria into a single score using weighted sum
  // Weight the criteria so earlier ones dominate:
  // - countWithFour: weight 1,000,000 (dominates everything)
  // - countLocked: weight 10,000 (second priority)
  // - formula: weight 100 (third priority, range roughly -10 to +10)
  // - tiebreaker: weight 1 (final tiebreaker, range 0.5 to 4)
  
  return Math.max(0, countWithFour * 1000000 + countLocked * 10000 + formula * 100 + tiebreaker);
}

/**
 * Evaluate a breeding pair and return the expected quality as a percentage of perfect.
 * 
 * This function:
 * 1. Generates all 1024 possible offspring genotypes (4^5 combinations)
 * 2. Calculates the quality score for each possible offspring
 * 3. Returns the average quality as a percentage of the maximum possible score
 * 
 * The quality score is based on our ordering criteria, with higher percentages indicating
 * better chocobos that will rank higher in competitions.
 * 
 * @param parent1 - First parent's stats as [father, mother] pairs for each stat
 * @param parent2 - Second parent's stats as [father, mother] pairs for each stat
 * @param superSprint - Whether to optimize for Super Sprint mode
 * @returns Expected quality percentage (0-100, higher is better)
 */
export function evaluateBreedingPair(
  parent1: ChocoboParentDataParsed,
  parent2: ChocoboParentDataParsed,
  superSprint: boolean = false
): number {
  // A. Generate the Universe (All 1024 children)
  // Each stat has 4 possibilities: (P1_F, P2_F), (P1_F, P2_M), (P1_M, P2_F), (P1_M, P2_M)
  
  const parent1Stats = [
    [parent1.fatherMaxSpeed, parent1.motherMaxSpeed],
    [parent1.fatherAcceleration, parent1.motherAcceleration],
    [parent1.fatherEndurance, parent1.motherEndurance],
    [parent1.fatherStamina, parent1.motherStamina],
    [parent1.fatherCunning, parent1.motherCunning],
  ];
  
  const parent2Stats = [
    [parent2.fatherMaxSpeed, parent2.motherMaxSpeed],
    [parent2.fatherAcceleration, parent2.motherAcceleration],
    [parent2.fatherEndurance, parent2.motherEndurance],
    [parent2.fatherStamina, parent2.motherStamina],
    [parent2.fatherCunning, parent2.motherCunning],
  ];
  
  const statOptions: Array<Array<[number, number]>> = [];
  for (let i = 0; i < 5; i++) {
    const p1Genes = parent1Stats[i]; // [father, mother]
    const p2Genes = parent2Stats[i]; // [father, mother]
    
    // Cartesian product for this specific stat
    // Creates: [[p1_f, p2_f], [p1_f, p2_m], [p1_m, p2_f], [p1_m, p2_m]]
    const options: Array<[number, number]> = [
      [p1Genes[0], p2Genes[0]],
      [p1Genes[0], p2Genes[1]],
      [p1Genes[1], p2Genes[0]],
      [p1Genes[1], p2Genes[1]],
    ];
    statOptions.push(options);
  }
  
  // Cartesian product of all stats (4*4*4*4*4 = 1024 genotypes)
  const allGenotypeCombos = cartesianProduct<[number, number]>(...statOptions);
  
  // B. Calculate quality score for each possible offspring
  let totalQuality = 0;
  
  for (const statArray of allGenotypeCombos) {
    const quality = calculateChocoboQualityScore(statArray, superSprint);
    totalQuality += quality;
  }
  
  // C. Calculate the average expected quality
  // This represents the expected quality of a random offspring from this pairing
  const expectedQuality = totalQuality / allGenotypeCombos.length;
  
  // D. Convert to percentage of maximum possible score
  const maxScore = calculateMaxPossibleScore(superSprint);
  const percentageScore = (expectedQuality / maxScore) * 100;
  
  return percentageScore;

}
