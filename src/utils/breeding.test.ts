import { describe, it, expect } from "vitest";
import {
  evaluateStatPotential,
  calculateBreedingScore,
  evaluateBreedingPair,
  type ChocoboParentData,
  type ChocoboParentDataParsed,
} from "./breeding";

describe("evaluateStatPotential", () => {
  it("should identify perfect breeding potential when all grandparents are 5", () => {
    const result = evaluateStatPotential(5, 5, 5, 5);
    
    expect(result.hasPerfect).toBe(true);
    expect(result.best).toBe(5);
    expect(result.worst).toBe(5);
    expect(result.average).toBe(5);
  });

  it("should identify perfect breeding potential when all grandparents are 4 (normalized to 5)", () => {
    const result = evaluateStatPotential(4, 4, 4, 4);
    
    expect(result.hasPerfect).toBe(true);
    expect(result.best).toBe(5);
    expect(result.worst).toBe(5);
    expect(result.average).toBe(5);
  });

  it("should calculate potential correctly with mixed stats", () => {
    // Male: father=5, mother=3; Female: father=4, mother=2
    const result = evaluateStatPotential(5, 3, 4, 2);
    
    expect(result.hasPerfect).toBe(false);
    expect(result.best).toBe(5);
    expect(result.worst).toBe(2);
    expect(result.average).toBe((5 + 3 + 5 + 2) / 4); // 3.75
  });

  it("should handle worst case scenario with all 1s", () => {
    const result = evaluateStatPotential(1, 1, 1, 1);
    
    expect(result.hasPerfect).toBe(false);
    expect(result.best).toBe(1);
    expect(result.worst).toBe(1);
    expect(result.average).toBe(1);
  });

  it("should normalize 4 to 5 in calculations", () => {
    const result = evaluateStatPotential(4, 5, 4, 5);
    
    expect(result.hasPerfect).toBe(true);
    expect(result.best).toBe(5);
    expect(result.worst).toBe(5);
  });

  it("should handle one perfect parent and one poor parent", () => {
    // Male has 5,5 (perfect), Female has 1,1 (poor)
    const result = evaluateStatPotential(5, 5, 1, 1);
    
    expect(result.hasPerfect).toBe(false);
    expect(result.best).toBe(5);
    expect(result.worst).toBe(1);
    expect(result.average).toBe((5 + 5 + 1 + 1) / 4); // 3.0
  });
});

describe("calculateBreedingScore", () => {
  it("should give highest score to perfect breeding pair", () => {
    const male: ChocoboParentData = {
      gender: "male",
      fatherMaxSpeed: "5",
      fatherAcceleration: "5",
      fatherEndurance: "5",
      fatherStamina: "5",
      fatherCunning: "5",
      motherMaxSpeed: "5",
      motherAcceleration: "5",
      motherEndurance: "5",
      motherStamina: "5",
      motherCunning: "5",
    };

    const female: ChocoboParentData = {
      gender: "female",
      fatherMaxSpeed: "5",
      fatherAcceleration: "5",
      fatherEndurance: "5",
      fatherStamina: "5",
      fatherCunning: "5",
      motherMaxSpeed: "5",
      motherAcceleration: "5",
      motherEndurance: "5",
      motherStamina: "5",
      motherCunning: "5",
    };

    const score = calculateBreedingScore(male, female);
    
    // Perfect pair should score 5 * 100 = 500
    expect(score).toBe(500);
  });

  it("should score pair with all 4s same as all 5s", () => {
    const male: ChocoboParentData = {
      gender: "male",
      fatherMaxSpeed: "4",
      fatherAcceleration: "4",
      fatherEndurance: "4",
      fatherStamina: "4",
      fatherCunning: "4",
      motherMaxSpeed: "4",
      motherAcceleration: "4",
      motherEndurance: "4",
      motherStamina: "4",
      motherCunning: "4",
    };

    const female: ChocoboParentData = {
      gender: "female",
      fatherMaxSpeed: "4",
      fatherAcceleration: "4",
      fatherEndurance: "4",
      fatherStamina: "4",
      fatherCunning: "4",
      motherMaxSpeed: "4",
      motherAcceleration: "4",
      motherEndurance: "4",
      motherStamina: "4",
      motherCunning: "4",
    };

    const score = calculateBreedingScore(male, female);
    
    expect(score).toBe(500);
  });

  it("should score poor breeding pair lower", () => {
    const male: ChocoboParentData = {
      gender: "male",
      fatherMaxSpeed: "1",
      fatherAcceleration: "1",
      fatherEndurance: "1",
      fatherStamina: "1",
      fatherCunning: "1",
      motherMaxSpeed: "1",
      motherAcceleration: "1",
      motherEndurance: "1",
      motherStamina: "1",
      motherCunning: "1",
    };

    const female: ChocoboParentData = {
      gender: "female",
      fatherMaxSpeed: "1",
      fatherAcceleration: "1",
      fatherEndurance: "1",
      fatherStamina: "1",
      fatherCunning: "1",
      motherMaxSpeed: "1",
      motherAcceleration: "1",
      motherEndurance: "1",
      motherStamina: "1",
      motherCunning: "1",
    };

    const score = calculateBreedingScore(male, female);
    
    // Poor pair should have negative score due to penalties
    expect(score).toBeLessThan(0);
  });

  it("should score mixed quality pair in between", () => {
    const perfectMale: ChocoboParentData = {
      gender: "male",
      fatherMaxSpeed: "5",
      fatherAcceleration: "5",
      fatherEndurance: "5",
      fatherStamina: "5",
      fatherCunning: "5",
      motherMaxSpeed: "5",
      motherAcceleration: "5",
      motherEndurance: "5",
      motherStamina: "5",
      motherCunning: "5",
    };

    const mixedFemale: ChocoboParentData = {
      gender: "female",
      fatherMaxSpeed: "3",
      fatherAcceleration: "3",
      fatherEndurance: "3",
      fatherStamina: "3",
      fatherCunning: "3",
      motherMaxSpeed: "3",
      motherAcceleration: "3",
      motherEndurance: "3",
      motherStamina: "3",
      motherCunning: "3",
    };

    const mixedScore = calculateBreedingScore(perfectMale, mixedFemale);
    
    expect(mixedScore).toBeGreaterThan(0);
    expect(mixedScore).toBeLessThan(500);
  });
});

describe("evaluateBreedingPair", () => {
  it("should return higher expected rank with 9 coverings than with fewer", () => {
    const parent1: ChocoboParentDataParsed = {
      gender: "male",
      coveringsLeft: 9,
      fatherMaxSpeed: 5,
      fatherAcceleration: 4,
      fatherEndurance: 3,
      fatherStamina: 5,
      fatherCunning: 2,
      motherMaxSpeed: 4,
      motherAcceleration: 5,
      motherEndurance: 4,
      motherStamina: 3,
      motherCunning: 3,
    };

    const parent2: ChocoboParentDataParsed = {
      gender: "female",
      coveringsLeft: 9,
      fatherMaxSpeed: 5,
      fatherAcceleration: 3,
      fatherEndurance: 5,
      fatherStamina: 4,
      fatherCunning: 2,
      motherMaxSpeed: 4,
      motherAcceleration: 4,
      motherEndurance: 3,
      motherStamina: 5,
      motherCunning: 3,
    };

    const resultWith9 = evaluateBreedingPair(parent1, parent2, false);

    // Now test with fewer coverings
    parent1.coveringsLeft = 3;
    parent2.coveringsLeft = 3;
    const resultWith3 = evaluateBreedingPair(parent1, parent2, false);

    // With 9 siblings, the expected best rank should be higher than with 3 siblings
    expect(resultWith9).toBeGreaterThan(resultWith3);
    expect(resultWith9).toBeGreaterThan(0);
    expect(resultWith9).toBeLessThan(1024);
    expect(resultWith3).toBeGreaterThan(0);
    expect(resultWith3).toBeLessThan(1024);
  });

  it("should handle coverings left of 1 (single offspring)", () => {
    const parent1: ChocoboParentDataParsed = {
      gender: "male",
      coveringsLeft: 1,
      fatherMaxSpeed: 5,
      fatherAcceleration: 5,
      fatherEndurance: 5,
      fatherStamina: 5,
      fatherCunning: 5,
      motherMaxSpeed: 5,
      motherAcceleration: 5,
      motherEndurance: 5,
      motherStamina: 5,
      motherCunning: 5,
    };

    const parent2: ChocoboParentDataParsed = {
      gender: "female",
      coveringsLeft: 1,
      fatherMaxSpeed: 5,
      fatherAcceleration: 5,
      fatherEndurance: 5,
      fatherStamina: 5,
      fatherCunning: 5,
      motherMaxSpeed: 5,
      motherAcceleration: 5,
      motherEndurance: 5,
      motherStamina: 5,
      motherCunning: 5,
    };

    const result = evaluateBreedingPair(parent1, parent2, false);

    // With perfect stats, single offspring should have expected rank of 511.5 (middle of 0-1023)
    expect(result).toBeCloseTo(511.5, 1);
  });

  it("should use minimum coverings between both parents", () => {
    const parent1: ChocoboParentDataParsed = {
      gender: "male",
      coveringsLeft: 9,
      fatherMaxSpeed: 3,
      fatherAcceleration: 3,
      fatherEndurance: 3,
      fatherStamina: 3,
      fatherCunning: 3,
      motherMaxSpeed: 3,
      motherAcceleration: 3,
      motherEndurance: 3,
      motherStamina: 3,
      motherCunning: 3,
    };

    const parent2: ChocoboParentDataParsed = {
      gender: "female",
      coveringsLeft: 2,
      fatherMaxSpeed: 3,
      fatherAcceleration: 3,
      fatherEndurance: 3,
      fatherStamina: 3,
      fatherCunning: 3,
      motherMaxSpeed: 3,
      motherAcceleration: 3,
      motherEndurance: 3,
      motherStamina: 3,
      motherCunning: 3,
    };

    const resultWith2 = evaluateBreedingPair(parent1, parent2, false);

    // Now swap and test - should get same result
    parent1.coveringsLeft = 2;
    parent2.coveringsLeft = 9;
    const resultSwapped = evaluateBreedingPair(parent1, parent2, false);

    expect(resultWith2).toBe(resultSwapped);
  });

  it("should show progressive improvement from 1 to 9 coverings", () => {
    const parent1: ChocoboParentDataParsed = {
      gender: "male",
      coveringsLeft: 1,
      fatherMaxSpeed: 4,
      fatherAcceleration: 4,
      fatherEndurance: 4,
      fatherStamina: 4,
      fatherCunning: 4,
      motherMaxSpeed: 4,
      motherAcceleration: 4,
      motherEndurance: 4,
      motherStamina: 4,
      motherCunning: 4,
    };

    const parent2: ChocoboParentDataParsed = {
      gender: "female",
      coveringsLeft: 1,
      fatherMaxSpeed: 4,
      fatherAcceleration: 4,
      fatherEndurance: 4,
      fatherStamina: 4,
      fatherCunning: 4,
      motherMaxSpeed: 4,
      motherAcceleration: 4,
      motherEndurance: 4,
      motherStamina: 4,
      motherCunning: 4,
    };

    const results: number[] = [];
    
    for (let coverings = 1; coverings <= 9; coverings++) {
      parent1.coveringsLeft = coverings;
      parent2.coveringsLeft = coverings;
      results.push(evaluateBreedingPair(parent1, parent2, false));
    }

    // Expected rank should increase with more coverings
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toBeGreaterThan(results[i - 1]);
    }
  });

  it("should work with super sprint mode and limited coverings", () => {
    const parent1: ChocoboParentDataParsed = {
      gender: "male",
      coveringsLeft: 3,
      fatherMaxSpeed: 5,
      fatherAcceleration: 2,
      fatherEndurance: 5,
      fatherStamina: 5,
      fatherCunning: 2,
      motherMaxSpeed: 4,
      motherAcceleration: 3,
      motherEndurance: 4,
      motherStamina: 4,
      motherCunning: 3,
    };

    const parent2: ChocoboParentDataParsed = {
      gender: "female",
      coveringsLeft: 3,
      fatherMaxSpeed: 4,
      fatherAcceleration: 2,
      fatherEndurance: 5,
      fatherStamina: 5,
      fatherCunning: 2,
      motherMaxSpeed: 5,
      motherAcceleration: 3,
      motherEndurance: 4,
      motherStamina: 4,
      motherCunning: 3,
    };

    const regularMode = evaluateBreedingPair(parent1, parent2, false);
    const superSprintMode = evaluateBreedingPair(parent1, parent2, true);

    // Both should return valid ranks
    expect(regularMode).toBeGreaterThan(0);
    expect(regularMode).toBeLessThan(1024);
    expect(superSprintMode).toBeGreaterThan(0);
    expect(superSprintMode).toBeLessThan(1024);
    
    // The ranks may differ based on optimization criteria
    // Super sprint prioritizes stamina + endurance
    // Regular mode prioritizes max speed + stamina
  });

  it("should handle edge case with 0 coverings left", () => {
    const parent1: ChocoboParentDataParsed = {
      gender: "male",
      coveringsLeft: 0,
      fatherMaxSpeed: 5,
      fatherAcceleration: 5,
      fatherEndurance: 5,
      fatherStamina: 5,
      fatherCunning: 5,
      motherMaxSpeed: 5,
      motherAcceleration: 5,
      motherEndurance: 5,
      motherStamina: 5,
      motherCunning: 5,
    };

    const parent2: ChocoboParentDataParsed = {
      gender: "female",
      coveringsLeft: 9,
      fatherMaxSpeed: 5,
      fatherAcceleration: 5,
      fatherEndurance: 5,
      fatherStamina: 5,
      fatherCunning: 5,
      motherMaxSpeed: 5,
      motherAcceleration: 5,
      motherEndurance: 5,
      motherStamina: 5,
      motherCunning: 5,
    };

    // Should use minimum (0), which will be treated as 0^9 = 0 for all probabilities
    const result = evaluateBreedingPair(parent1, parent2, false);
    
    // With 0 coverings, the result should be 0 (no offspring possible)
    expect(result).toBe(0);
  });

  it("should evaluate different breeding pairs with limited coverings", () => {
    const parent1: ChocoboParentDataParsed = {
      gender: "male",
      coveringsLeft: 5,
      fatherMaxSpeed: 1,
      fatherAcceleration: 2,
      fatherEndurance: 1,
      fatherStamina: 2,
      fatherCunning: 1,
      motherMaxSpeed: 2,
      motherAcceleration: 1,
      motherEndurance: 2,
      motherStamina: 1,
      motherCunning: 2,
    };

    const parent2: ChocoboParentDataParsed = {
      gender: "female",
      coveringsLeft: 5,
      fatherMaxSpeed: 2,
      fatherAcceleration: 1,
      fatherEndurance: 1,
      fatherStamina: 1,
      fatherCunning: 2,
      motherMaxSpeed: 1,
      motherAcceleration: 2,
      motherEndurance: 2,
      motherStamina: 2,
      motherCunning: 1,
    };

    const result = evaluateBreedingPair(parent1, parent2, false);

    // Should return a valid rank
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1024);
  });
});

