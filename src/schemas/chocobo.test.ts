import { describe, it, expect } from "vitest";
import {
  ChocoboSchema,
  ChocoboListSchema,
  ChocoboExportSchema,
  ChocoboGenderSchema,
  ChocoboAbilitySchema,
  StatValueSchema,
  ChocoboStatsSchema,
  createDefaultChocobo,
  calculateChocoboQuality,
  validateChocobo,
  validateExport,
  type Chocobo,
} from "./chocobo";

describe("StatValueSchema", () => {
  it("should accept valid stat values (1-5)", () => {
    expect(StatValueSchema.parse(1)).toBe(1);
    expect(StatValueSchema.parse(2)).toBe(2);
    expect(StatValueSchema.parse(3)).toBe(3);
    expect(StatValueSchema.parse(4)).toBe(4);
    expect(StatValueSchema.parse(5)).toBe(5);
  });

  it("should reject values below 1", () => {
    expect(() => StatValueSchema.parse(0)).toThrow();
    expect(() => StatValueSchema.parse(-1)).toThrow();
  });

  it("should reject values above 5", () => {
    expect(() => StatValueSchema.parse(6)).toThrow();
    expect(() => StatValueSchema.parse(10)).toThrow();
  });

  it("should reject non-integer values", () => {
    expect(() => StatValueSchema.parse(2.5)).toThrow();
    expect(() => StatValueSchema.parse(3.14)).toThrow();
  });

  it("should reject non-numeric values", () => {
    expect(() => StatValueSchema.parse("3")).toThrow();
    expect(() => StatValueSchema.parse(null)).toThrow();
    expect(() => StatValueSchema.parse(undefined)).toThrow();
  });
});

describe("ChocoboGenderSchema", () => {
  it("should accept male gender", () => {
    expect(ChocoboGenderSchema.parse("male")).toBe("male");
  });

  it("should accept female gender", () => {
    expect(ChocoboGenderSchema.parse("female")).toBe("female");
  });

  it("should reject invalid gender values", () => {
    expect(() => ChocoboGenderSchema.parse("other")).toThrow();
    expect(() => ChocoboGenderSchema.parse("")).toThrow();
    expect(() => ChocoboGenderSchema.parse(null)).toThrow();
  });
});

describe("ChocoboAbilitySchema", () => {
  it("should accept valid abilities", () => {
    expect(ChocoboAbilitySchema.parse("Choco Cure")).toBe("Choco Cure");
    expect(ChocoboAbilitySchema.parse("Choco Dash")).toBe("Choco Dash");
    expect(ChocoboAbilitySchema.parse("Head Start")).toBe("Head Start");
    expect(ChocoboAbilitySchema.parse("Increased Stamina I")).toBe("Increased Stamina I");
  });

  it("should accept undefined (optional)", () => {
    expect(ChocoboAbilitySchema.parse(undefined)).toBeUndefined();
  });

  it("should reject invalid ability values", () => {
    expect(() => ChocoboAbilitySchema.parse("Invalid Ability")).toThrow();
    expect(() => ChocoboAbilitySchema.parse("")).toThrow();
  });
});

describe("ChocoboStatsSchema", () => {
  it("should accept valid stats object", () => {
    const stats = {
      fatherMaxSpeed: 3,
      fatherAcceleration: 4,
      fatherEndurance: 2,
      fatherStamina: 5,
      fatherCunning: 1,
      motherMaxSpeed: 2,
      motherAcceleration: 3,
      motherEndurance: 4,
      motherStamina: 1,
      motherCunning: 5,
    };

    expect(ChocoboStatsSchema.parse(stats)).toEqual(stats);
  });

  it("should reject stats with missing fields", () => {
    const incompleteStats = {
      fatherMaxSpeed: 3,
      fatherAcceleration: 4,
      // missing other fields
    };

    expect(() => ChocoboStatsSchema.parse(incompleteStats)).toThrow();
  });

  it("should reject stats with invalid values", () => {
    const invalidStats = {
      fatherMaxSpeed: 6, // invalid (>5)
      fatherAcceleration: 4,
      fatherEndurance: 2,
      fatherStamina: 5,
      fatherCunning: 1,
      motherMaxSpeed: 2,
      motherAcceleration: 3,
      motherEndurance: 4,
      motherStamina: 1,
      motherCunning: 5,
    };

    expect(() => ChocoboStatsSchema.parse(invalidStats)).toThrow();
  });
});

describe("ChocoboSchema", () => {
  it("should accept a valid chocobo", () => {
    const chocobo = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      gender: "male" as const,
      grade: 5,
      ability: "Choco Dash" as const,
      stats: {
        fatherMaxSpeed: 3,
        fatherAcceleration: 4,
        fatherEndurance: 2,
        fatherStamina: 5,
        fatherCunning: 1,
        motherMaxSpeed: 2,
        motherAcceleration: 3,
        motherEndurance: 4,
        motherStamina: 1,
        motherCunning: 5,
      },
      coveringsLeft: 9,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    };

    expect(ChocoboSchema.parse(chocobo)).toEqual(chocobo);
  });

  it("should accept chocobo without optional fields", () => {
    const chocobo = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      gender: "female" as const,
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
    };

    expect(ChocoboSchema.parse(chocobo)).toEqual(chocobo);
  });

  it("should reject chocobo with invalid id", () => {
    const chocobo = {
      id: "not-a-uuid",
      gender: "male" as const,
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
    };

    expect(() => ChocoboSchema.parse(chocobo)).toThrow();
  });

  it("should reject chocobo with invalid grade", () => {
    const chocobo = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      gender: "male" as const,
      grade: 10, // invalid (>9)
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
    };

    expect(() => ChocoboSchema.parse(chocobo)).toThrow();
  });

  it("should reject chocobo with missing required fields", () => {
    const chocobo = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      gender: "male" as const,
      // missing stats
    };

    expect(() => ChocoboSchema.parse(chocobo)).toThrow();
  });
});

describe("ChocoboListSchema", () => {
  it("should accept an array of valid chocobos", () => {
    const chocobos = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        gender: "male" as const,
        stats: {
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
        },
        coveringsLeft: 9,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        gender: "female" as const,
        grade: 5,
        ability: "Choco Cure" as const,
        stats: {
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
        },
        coveringsLeft: 9,
      },
    ];

    expect(ChocoboListSchema.parse(chocobos)).toEqual(chocobos);
  });

  it("should accept an empty array", () => {
    expect(ChocoboListSchema.parse([])).toEqual([]);
  });

  it("should reject array with invalid chocobo", () => {
    const chocobos = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        gender: "male" as const,
        stats: {
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
        },
      },
      {
        id: "invalid-id",
        gender: "female" as const,
        stats: {
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
        },
      },
    ];

    expect(() => ChocoboListSchema.parse(chocobos)).toThrow();
  });
});

describe("ChocoboExportSchema", () => {
  it("should accept valid export data", () => {
    const exportData = {
      version: "1.0" as const,
      exportedAt: "2025-01-01T00:00:00.000Z",
      chocobos: [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          gender: "male" as const,
          stats: {
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
          },
          coveringsLeft: 9,
        },
      ],
    };

    expect(ChocoboExportSchema.parse(exportData)).toEqual(exportData);
  });

  it("should reject export with wrong version", () => {
    const exportData = {
      version: "2.0",
      exportedAt: "2025-01-01T00:00:00.000Z",
      chocobos: [],
    };

    expect(() => ChocoboExportSchema.parse(exportData)).toThrow();
  });

  it("should reject export with invalid date", () => {
    const exportData = {
      version: "1.0" as const,
      exportedAt: "not-a-date",
      chocobos: [],
    };

    expect(() => ChocoboExportSchema.parse(exportData)).toThrow();
  });

  it("should reject export without chocobos field", () => {
    const exportData = {
      version: "1.0" as const,
      exportedAt: "2025-01-01T00:00:00.000Z",
    };

    expect(() => ChocoboExportSchema.parse(exportData)).toThrow();
  });
});

describe("createDefaultChocobo", () => {
  it("should create a male chocobo with default stats", () => {
    const chocobo = createDefaultChocobo("male");

    expect(chocobo.gender).toBe("male");
    expect(chocobo.stats.fatherMaxSpeed).toBe(1);
    expect(chocobo.stats.fatherAcceleration).toBe(1);
    expect(chocobo.stats.fatherEndurance).toBe(1);
    expect(chocobo.stats.fatherStamina).toBe(1);
    expect(chocobo.stats.fatherCunning).toBe(1);
    expect(chocobo.stats.motherMaxSpeed).toBe(1);
    expect(chocobo.stats.motherAcceleration).toBe(1);
    expect(chocobo.stats.motherEndurance).toBe(1);
    expect(chocobo.stats.motherStamina).toBe(1);
    expect(chocobo.stats.motherCunning).toBe(1);
    expect(chocobo.id).toBeTruthy();
    expect(chocobo.createdAt).toBeTruthy();
    expect(chocobo.updatedAt).toBeTruthy();
  });

  it("should create a female chocobo with default stats", () => {
    const chocobo = createDefaultChocobo("female");

    expect(chocobo.gender).toBe("female");
    expect(chocobo.stats.fatherMaxSpeed).toBe(1);
  });

  it("should generate unique IDs", () => {
    const chocobo1 = createDefaultChocobo("male");
    const chocobo2 = createDefaultChocobo("male");

    expect(chocobo1.id).not.toBe(chocobo2.id);
  });
});

describe("calculateChocoboQuality", () => {
  it("should calculate total stat value correctly", () => {
    const chocobo: Chocobo = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      gender: "male",
      stats: {
        fatherMaxSpeed: 3,
        fatherAcceleration: 4,
        fatherEndurance: 2,
        fatherStamina: 5,
        fatherCunning: 1,
        motherMaxSpeed: 2,
        motherAcceleration: 3,
        motherEndurance: 4,
        motherStamina: 1,
        motherCunning: 5,
      },
      coveringsLeft: 9,
    };

    const quality = calculateChocoboQuality(chocobo);

    expect(quality).toBe(30); // 3+4+2+5+1+2+3+4+1+5 = 30
  });

  it("should return 10 for minimum stats chocobo", () => {
    const chocobo: Chocobo = createDefaultChocobo("female");

    const quality = calculateChocoboQuality(chocobo);

    expect(quality).toBe(10); // All stats are 1, 10 total stats
  });

  it("should return 50 for maximum stats chocobo", () => {
    const chocobo: Chocobo = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      gender: "male",
      stats: {
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
      },
      coveringsLeft: 9,
    };

    const quality = calculateChocoboQuality(chocobo);

    expect(quality).toBe(50); // All stats are 5, 10 total stats
  });
});

describe("validateChocobo", () => {
  it("should validate and return valid chocobo", () => {
    const data = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      gender: "male",
      stats: {
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
      },
      coveringsLeft: 9,
    };

    expect(validateChocobo(data)).toEqual(data);
  });

  it("should throw error for invalid chocobo", () => {
    const data = {
      id: "invalid-id",
      gender: "male",
      stats: {
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
      },
    };

    expect(() => validateChocobo(data)).toThrow();
  });
});

describe("validateExport", () => {
  it("should validate and return valid export data", () => {
    const data = {
      version: "1.0",
      exportedAt: "2025-01-01T00:00:00.000Z",
      chocobos: [],
    };

    expect(validateExport(data)).toEqual(data);
  });

  it("should throw error for invalid export data", () => {
    const data = {
      version: "2.0",
      exportedAt: "2025-01-01T00:00:00.000Z",
      chocobos: [],
    };

    expect(() => validateExport(data)).toThrow();
  });
});
