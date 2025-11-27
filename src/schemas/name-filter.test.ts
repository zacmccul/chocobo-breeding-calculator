import { describe, it, expect } from "vitest";
import { ChocoboSchema } from "./chocobo";

describe("Chocobo Name Field", () => {
  it("should accept chocobo with name", () => {
    const chocobo = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      gender: "male" as const,
      name: "Swift Runner",
      stats: {
        fatherMaxSpeed: 5,
        fatherAcceleration: 4,
        fatherEndurance: 3,
        fatherStamina: 2,
        fatherCunning: 1,
        motherMaxSpeed: 1,
        motherAcceleration: 2,
        motherEndurance: 3,
        motherStamina: 4,
        motherCunning: 5,
      },
      coveringsLeft: 9,
    };

    const result = ChocoboSchema.parse(chocobo);
    expect(result.name).toBe("Swift Runner");
  });

  it("should accept chocobo without name", () => {
    const chocobo = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      gender: "female" as const,
      stats: {
        fatherMaxSpeed: 5,
        fatherAcceleration: 4,
        fatherEndurance: 3,
        fatherStamina: 2,
        fatherCunning: 1,
        motherMaxSpeed: 1,
        motherAcceleration: 2,
        motherEndurance: 3,
        motherStamina: 4,
        motherCunning: 5,
      },
      coveringsLeft: 9,
    };

    const result = ChocoboSchema.parse(chocobo);
    expect(result.name).toBeUndefined();
  });

  it("should accept empty string as name", () => {
    const chocobo = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      gender: "male" as const,
      name: "",
      stats: {
        fatherMaxSpeed: 5,
        fatherAcceleration: 4,
        fatherEndurance: 3,
        fatherStamina: 2,
        fatherCunning: 1,
        motherMaxSpeed: 1,
        motherAcceleration: 2,
        motherEndurance: 3,
        motherStamina: 4,
        motherCunning: 5,
      },
      coveringsLeft: 9,
    };

    const result = ChocoboSchema.parse(chocobo);
    expect(result.name).toBe("");
  });
});

describe("Name Filter Logic", () => {
  it("should filter by name with lowercase and whitespace stripping", () => {
    const chocobo1 = {
      id: "123e4567-e89b-12d3-a456-426614174001",
      gender: "male" as const,
      name: "Swift Runner",
      stats: {
        fatherMaxSpeed: 5,
        fatherAcceleration: 4,
        fatherEndurance: 3,
        fatherStamina: 2,
        fatherCunning: 1,
        motherMaxSpeed: 1,
        motherAcceleration: 2,
        motherEndurance: 3,
        motherStamina: 4,
        motherCunning: 5,
      },
      coveringsLeft: 9,
    };

    const chocobo2 = {
      id: "123e4567-e89b-12d3-a456-426614174002",
      gender: "female" as const,
      name: "Thunder Cloud",
      stats: {
        fatherMaxSpeed: 5,
        fatherAcceleration: 4,
        fatherEndurance: 3,
        fatherStamina: 2,
        fatherCunning: 1,
        motherMaxSpeed: 1,
        motherAcceleration: 2,
        motherEndurance: 3,
        motherStamina: 4,
        motherCunning: 5,
      },
      coveringsLeft: 9,
    };

    const chocobo3 = {
      id: "123e4567-e89b-12d3-a456-426614174003",
      gender: "male" as const,
      name: "Lightning Bolt",
      stats: {
        fatherMaxSpeed: 5,
        fatherAcceleration: 4,
        fatherEndurance: 3,
        fatherStamina: 2,
        fatherCunning: 1,
        motherMaxSpeed: 1,
        motherAcceleration: 2,
        motherEndurance: 3,
        motherStamina: 4,
        motherCunning: 5,
      },
      coveringsLeft: 9,
    };

    const chocobos = [chocobo1, chocobo2, chocobo3];

    // Test lowercase stripped comparison
    const searchQuery = "swift";
    const filtered = chocobos.filter((chocobo) => {
      if (!chocobo.name) return false;
      const normalizedName = chocobo.name.toLowerCase().replace(/\s+/g, "");
      const normalizedQuery = searchQuery.toLowerCase().replace(/\s+/g, "");
      return normalizedName.includes(normalizedQuery);
    });

    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe("Swift Runner");
  });

  it("should handle search with whitespace in query", () => {
    const chocobo = {
      id: "123e4567-e89b-12d3-a456-426614174001",
      gender: "male" as const,
      name: "Swift Runner",
      stats: {
        fatherMaxSpeed: 5,
        fatherAcceleration: 4,
        fatherEndurance: 3,
        fatherStamina: 2,
        fatherCunning: 1,
        motherMaxSpeed: 1,
        motherAcceleration: 2,
        motherEndurance: 3,
        motherStamina: 4,
        motherCunning: 5,
      },
      coveringsLeft: 9,
    };

    const chocobos = [chocobo];

    // Test with whitespace in search query
    const searchQuery = "swift run";
    const filtered = chocobos.filter((chocobo) => {
      if (!chocobo.name) return false;
      const normalizedName = chocobo.name.toLowerCase().replace(/\s+/g, "");
      const normalizedQuery = searchQuery.toLowerCase().replace(/\s+/g, "");
      return normalizedName.includes(normalizedQuery);
    });

    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe("Swift Runner");
  });

  it("should handle case insensitive search", () => {
    const chocobo = {
      id: "123e4567-e89b-12d3-a456-426614174001",
      gender: "male" as const,
      name: "Swift Runner",
      stats: {
        fatherMaxSpeed: 5,
        fatherAcceleration: 4,
        fatherEndurance: 3,
        fatherStamina: 2,
        fatherCunning: 1,
        motherMaxSpeed: 1,
        motherAcceleration: 2,
        motherEndurance: 3,
        motherStamina: 4,
        motherCunning: 5,
      },
      coveringsLeft: 9,
    };

    const chocobos = [chocobo];

    // Test case insensitivity
    const searchQueries = ["SWIFT", "Swift", "sWiFt", "swift"];
    searchQueries.forEach((query) => {
      const filtered = chocobos.filter((chocobo) => {
        if (!chocobo.name) return false;
        const normalizedName = chocobo.name.toLowerCase().replace(/\s+/g, "");
        const normalizedQuery = query.toLowerCase().replace(/\s+/g, "");
        return normalizedName.includes(normalizedQuery);
      });

      expect(filtered.length).toBe(1);
    });
  });
});
