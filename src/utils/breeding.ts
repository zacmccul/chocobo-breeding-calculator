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
 * Orders two chocobos by the following criteria, using each sucessive tiebreaker:
 *   1. The most number of stats that contain at least 1 5 star.
 *   2. The most number of stats that are locked, i.e. contain only 5 stars.
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

  // Criterion 1: Count stats that contain at least one 5
  const countWithFive = (stats: number[][]) => 
    stats.filter(([father, mother]) => father === 5 || mother === 5).length;
  
  const aWithFive = countWithFive(statsA);
  const bWithFive = countWithFive(statsB);
  
  if (aWithFive !== bWithFive) {
    return bWithFive - aWithFive; // More 5s is better, so b > a means negative (b comes first)
  }

  // Criterion 2: Count locked stats (both father and mother are 5)
  const countLocked = (stats: number[][]) => 
    stats.filter(([father, mother]) => father === 5 && mother === 5).length;
  
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
  hasPerfect: boolean; // True if both parent values are max (4 or 5)
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
  
  // Perfect inheritance: all four grandparent stats are 5
  const hasPerfect = possibleValues.every(v => v === 5);

  return { best, worst, average, hasPerfect };
}

/**
 * Calculate overall breeding quality score for a pair.
 * Higher score = better breeding potential toward all 5-star offspring.
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
    // 1. Perfect stats (all 4/5) are most valuable: +100 points
    // 2. Best possible outcome: +20 * best value
    // 3. Average potential: +10 * average
    // 4. Penalty for worst case: -5 * (5 - worst)
    
    let statScore = 0;
    
    if (potential.hasPerfect) {
      statScore += 100; // Guaranteed 5-star inheritance
    } else {
      statScore += potential.best * 20;     // Reward high ceiling
      statScore += potential.average * 10;   // Reward good average
      statScore -= (5 - potential.worst) * 5; // Penalize low floor
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
 * Represents a chocobo genotype with father and mother genes for each stat
 */
interface ChocoboGenotype {
  stats: Array<[number, number]>; // [father gene, mother gene] for each of 5 stats
}

/**
 * Create a comparator function for sorting chocobos by quality
 */
function createChocoboComparator(superSprint: boolean = false) {
  return (a: ChocoboGenotype, b: ChocoboGenotype): number => {
    const statsA = a.stats;
    const statsB = b.stats;

    // Criterion 1: Count stats that contain at least one 5
    const countWithFive = (stats: Array<[number, number]>) => 
      stats.filter(([father, mother]) => father === 5 || mother === 5).length;
    
    const aWithFive = countWithFive(statsA);
    const bWithFive = countWithFive(statsB);
    
    if (aWithFive !== bWithFive) {
      return aWithFive - bWithFive; // Ascending sort (worst to best)
    }

    // Criterion 2: Count locked stats (both father and mother are 5)
    const countLocked = (stats: Array<[number, number]>) => 
      stats.filter(([father, mother]) => father === 5 && mother === 5).length;
    
    const aLocked = countLocked(statsA);
    const bLocked = countLocked(statsB);
    
    if (aLocked !== bLocked) {
      return aLocked - bLocked; // Ascending sort
    }

    // Get individual stat averages
    const getStatAvg = (stats: Array<[number, number]>, index: number) => {
      const [father, mother] = stats[index];
      return (father + mother) / 2;
    };

    // Stat indices: 0=MaxSpeed, 1=Acceleration, 2=Endurance, 3=Stamina, 4=Cunning
    if (!superSprint) {
      // Criterion 3: Max Speed + Stamina - Cunning - Acceleration
      const calcFormula3 = (stats: Array<[number, number]>) => 
        getStatAvg(stats, 0) + 
        getStatAvg(stats, 3) - 
        getStatAvg(stats, 4) - 
        getStatAvg(stats, 1);
      
      const aFormula = calcFormula3(statsA);
      const bFormula = calcFormula3(statsB);
      
      if (aFormula !== bFormula) {
        return aFormula - bFormula; // Ascending sort
      }
      
      // Tiebreaker: max endurance
      const aEndurance = getStatAvg(statsA, 2);
      const bEndurance = getStatAvg(statsB, 2);
      
      return aEndurance - bEndurance; // Ascending sort
    } else {
      // Criterion 4: Stamina + Endurance - Cunning - Acceleration
      const calcFormula4 = (stats: Array<[number, number]>) => 
        getStatAvg(stats, 3) + 
        getStatAvg(stats, 2) - 
        getStatAvg(stats, 4) - 
        getStatAvg(stats, 1);
      
      const aFormula = calcFormula4(statsA);
      const bFormula = calcFormula4(statsB);
      
      if (aFormula !== bFormula) {
        return aFormula - bFormula; // Ascending sort
      }
      
      // Tiebreaker: max speed
      const aMaxSpeed = getStatAvg(statsA, 0);
      const bMaxSpeed = getStatAvg(statsB, 0);
      
      return aMaxSpeed - bMaxSpeed; // Ascending sort
    }
  };
}

/**
 * Evaluate a breeding pair and return the expected rank (0-1023) of the best child out of 9 siblings.
 * 
 * This function:
 * 1. Generates all 1024 possible offspring genotypes (4^5 combinations)
 * 2. Sorts them by quality using the chocobo comparator
 * 3. Calculates the expected value of the best offspring from 9 random siblings
 * 
 * @param parent1 - First parent's stats as [father, mother] pairs for each stat
 * @param parent2 - Second parent's stats as [father, mother] pairs for each stat
 * @param superSprint - Whether to optimize for Super Sprint mode
 * @returns Expected rank (0-1023) where higher is better
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
  
  // Convert to ChocoboGenotype objects
  const children: ChocoboGenotype[] = allGenotypeCombos.map(statArray => ({
    stats: statArray
  }));
  
  // B. Sort the Universe (ascending: worst -> best)
  children.sort(createChocoboComparator(superSprint));
  
  // C. Calculate Expected Value of the Winner (Best of 9)
  // The "Value" of a child is its index (rank) in this sorted list (0 to 1023)
  // EV = Sum( Index * Prob(Winner == Index) )
  
  let expectedRankSum = 0;
  const totalSpace = 1024.0;
  const siblings = Math.min(9, parent1.coveringsLeft, parent2.coveringsLeft);
  
  for (let i = 0; i < 1024; i++) {
    const rankValue = i;
    
    // Prob that a single random child is rank <= i
    const cdfCurrent = (i + 1) / totalSpace;
    // Prob that a single random child is rank <= i-1
    const cdfPrev = i / totalSpace;
    
    // Prob that the MAX of 9 children is exactly rank i
    // P(Max=i) = F(i)^9 - F(i-1)^9
    const probIsWinner = Math.pow(cdfCurrent, siblings) - Math.pow(cdfPrev, siblings);
    
    expectedRankSum += rankValue * probIsWinner;
  }
  
  return expectedRankSum;
}
