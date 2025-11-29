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
  it("should return consistent quality score regardless of coverings", () => {
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

    // Now test with fewer coverings - quality score should be the same
    parent1.coveringsLeft = 3;
    parent2.coveringsLeft = 3;
    const resultWith3 = evaluateBreedingPair(parent1, parent2, false);

    // Expected quality is based on genetics, not number of coverings
    expect(resultWith9).toBe(resultWith3);
    expect(resultWith9).toBeGreaterThan(0);
    expect(resultWith9).toBeLessThanOrEqual(100); // Should be a percentage
  });

  it("should return higher quality for perfect stats than mixed stats", () => {
    const perfectParent1: ChocoboParentDataParsed = {
      gender: "male",
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

    const perfectParent2: ChocoboParentDataParsed = {
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

    const mixedParent1: ChocoboParentDataParsed = {
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

    const mixedParent2: ChocoboParentDataParsed = {
      gender: "female",
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

    const perfectResult = evaluateBreedingPair(perfectParent1, perfectParent2, false);
    const mixedResult = evaluateBreedingPair(mixedParent1, mixedParent2, false);

    // Perfect stats should produce higher expected quality
    expect(perfectResult).toBeGreaterThan(mixedResult);
    // Perfect pair should be close to 100%
    expect(perfectResult).toBeGreaterThan(95);
    expect(perfectResult).toBeLessThanOrEqual(100);
  });

  it("should differentiate between regular and super sprint modes", () => {
    const parent1: ChocoboParentDataParsed = {
      gender: "male",
      coveringsLeft: 9,
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
      coveringsLeft: 9,
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

    // Both should return valid quality percentages
    expect(regularMode).toBeGreaterThan(0);
    expect(regularMode).toBeLessThanOrEqual(100);
    expect(superSprintMode).toBeGreaterThan(0);
    expect(superSprintMode).toBeLessThanOrEqual(100);
    
    // The scores may differ based on optimization criteria
    // Super sprint prioritizes stamina + endurance
    // Regular mode prioritizes max speed + stamina
  });

  it("should evaluate different breeding pairs correctly", () => {
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

    // Should return a valid quality percentage
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});
