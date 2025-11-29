import React, { useState, useEffect } from "react";
import {
  Card,
  Box,
  Text,
  Input,
  IconButton,
  HStack,
  VStack,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { Switch } from "@chakra-ui/react";
import { X } from "lucide-react";
import type { Chocobo } from "../schemas/chocobo";
import { useChocoboStore } from "../store/chocoboStore";

interface ChocoboCardProps {
  chocobo: Chocobo;
  onDelete: () => void;
}

const StatInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  disabled?: boolean;
}> = ({ label, value, onChange, color, disabled = false }) => {
  const clampedValue = Math.max(0, Math.min(4, value));
  const stars = "★".repeat(clampedValue) + "☆".repeat(Math.max(0, 4 - clampedValue));

  return (
    <HStack gap={2} width="full">
      <Text fontSize="sm" minWidth="24" color={color}>
        {label}:
      </Text>
      <Input
        type="number"
        min={1}
        max={4}
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          if (!isNaN(val) && val >= 1 && val <= 4) {
            onChange(val);
          }
        }}
        size="sm"
        width="16"
        textAlign="center"
        disabled={disabled}
      />
      <Text fontSize="lg" color={color} userSelect="none">
        {stars}
      </Text>
    </HStack>
  );
};

export const ChocoboCard: React.FC<ChocoboCardProps> = ({ chocobo, onDelete }) => {
  const { updateChocobo, updateChocoboStats, isEditMode } = useChocoboStore();
  
  // Local state for debounced name input
  const [localName, setLocalName] = useState(chocobo.name || "");

  const isMale = chocobo.gender === "male";
  const borderColor = isMale ? "blue.300" : "red.300";
  const switchColorScheme = isMale ? "blue" : "red";

  // Sync local state when chocobo.name changes from external source
  useEffect(() => {
    setLocalName(chocobo.name || "");
  }, [chocobo.name]);

  // Debounce the name update to the store
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedName = localName.trim();
      const currentName = chocobo.name || "";
      
      // Only update if the value has actually changed
      if (trimmedName !== currentName) {
        updateChocobo(chocobo.id, { name: trimmedName === "" ? undefined : trimmedName });
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [localName, chocobo.id, chocobo.name, updateChocobo]);

  const handleGenderChange = () => {
    console.log('Gender change triggered:', { currentGender: chocobo.gender, chocoboId: chocobo.id });
    const newGender = chocobo.gender === "male" ? "female" : "male";
    console.log('Updating to:', newGender);
    updateChocobo(chocobo.id, { gender: newGender });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalName(e.target.value);
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      updateChocobo(chocobo.id, { grade: undefined });
    } else {
      const grade = parseInt(val);
      if (!isNaN(grade) && grade >= 1 && grade <= 9) {
        updateChocobo(chocobo.id, { grade });
      }
    }
  };

  const handleCoveringsLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      updateChocobo(chocobo.id, { coveringsLeft: 9 });
    } else {
      const coveringsLeft = parseInt(val);
      if (!isNaN(coveringsLeft) && coveringsLeft >= 0 && coveringsLeft <= 10) {
        updateChocobo(chocobo.id, { coveringsLeft });
      }
    }
  };

  const handleAbilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "") {
      updateChocobo(chocobo.id, { ability: undefined });
    } else {
      updateChocobo(chocobo.id, { ability: val as any });
    }
  };

  const abilities = [
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
  ];

  return (
    <Card.Root
      borderWidth={2}
      borderColor={borderColor}
      padding={4}
      position="relative"
      bg="white"
    >
      <IconButton
        aria-label="Delete chocobo"
        size="sm"
        position="absolute"
        top={2}
        right={2}
        onClick={onDelete}
        colorScheme="red"
        variant="ghost"
      >
        <X size={16} />
      </IconButton>

      <VStack align="stretch" gap={3}>
        {/* Name Input */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>
            Name:
          </Text>
          <Input
            type="text"
            value={localName}
            onChange={handleNameChange}
            placeholder="Optional chocobo name"
            size="sm"
            disabled={!isEditMode}
          />
        </Box>

        {/* Gender and Grade Row */}
        <HStack gap={4} flexWrap="wrap">
          <HStack>
            <Text fontSize="sm" fontWeight="medium">
              Gender:
            </Text>
            <Switch.Root
              checked={isMale}
              onCheckedChange={handleGenderChange}
              colorPalette={switchColorScheme}
              aria-label="Toggle gender"
              disabled={!isEditMode}
            >
              <Switch.Control 
                tabIndex={0}
                onClick={() => {
                  console.log('Switch control clicked');
                  handleGenderChange();
                }}
              >
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Label fontSize="sm" fontWeight="medium" color={borderColor}>
                {isMale ? "Male" : "Female"}
              </Switch.Label>
            </Switch.Root>
          </HStack>

          <HStack>
            <Text fontSize="sm" fontWeight="medium">
              Grade:
            </Text>
            <Input
              type="number"
              min={1}
              max={9}
              value={chocobo.grade || ""}
              onChange={handleGradeChange}
              placeholder="1-9"
              size="sm"
              width="16"
              textAlign="center"
              disabled={!isEditMode}
            />
          </HStack>

          <HStack>
            <Text fontSize="sm" fontWeight="medium">
              Coverings:
            </Text>
            <Input
              type="number"
              min={0}
              max={10}
              value={chocobo.coveringsLeft}
              onChange={handleCoveringsLeftChange}
              size="sm"
              width="16"
              textAlign="center"
              disabled={!isEditMode}
            />
          </HStack>
        </HStack>

        {/* Ability Dropdown */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>
            Ability:
          </Text>
          <select
            value={chocobo.ability || ""}
            onChange={handleAbilityChange}
            disabled={!isEditMode}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.375rem",
              border: "1px solid #E2E8F0",
            }}
          >
            <option value="">None</option>
            {abilities.map((ability: string) => (
              <option key={ability} value={ability}>
                {ability}
              </option>
            ))}
          </select>
        </Box>

        {/* Stats in two columns */}
        <Grid templateColumns="1fr 1fr" gap={4}>
          {/* Father Stats (Blue) */}
          <GridItem>
            <Text fontSize="md" fontWeight="bold" color="blue.600" mb={2}>
              Father's Stats
            </Text>
            <VStack align="stretch" gap={1}>
              <StatInput
                label="Max Speed"
                value={chocobo.stats.fatherMaxSpeed}
                onChange={(v) =>
                  updateChocoboStats(chocobo.id, { fatherMaxSpeed: v })
                }
                color="blue.600"
                disabled={!isEditMode}
              />
              <StatInput
                label="Acceleration"
                value={chocobo.stats.fatherAcceleration}
                onChange={(v) =>
                  updateChocoboStats(chocobo.id, { fatherAcceleration: v })
                }
                color="blue.600"
                disabled={!isEditMode}
              />
              <StatInput
                label="Endurance"
                value={chocobo.stats.fatherEndurance}
                onChange={(v) =>
                  updateChocoboStats(chocobo.id, { fatherEndurance: v })
                }
                color="blue.600"
                disabled={!isEditMode}
              />
              <StatInput
                label="Stamina"
                value={chocobo.stats.fatherStamina}
                onChange={(v) =>
                  updateChocoboStats(chocobo.id, { fatherStamina: v })
                }
                color="blue.600"
                disabled={!isEditMode}
              />
              <StatInput
                label="Cunning"
                value={chocobo.stats.fatherCunning}
                onChange={(v) =>
                  updateChocoboStats(chocobo.id, { fatherCunning: v })
                }
                color="blue.600"
                disabled={!isEditMode}
              />
            </VStack>
          </GridItem>

          {/* Mother Stats (Red) */}
          <GridItem>
            <Text fontSize="md" fontWeight="bold" color="red.600" mb={2}>
              Mother's Stats
            </Text>
            <VStack align="stretch" gap={1}>
              <StatInput
                label="Max Speed"
                value={chocobo.stats.motherMaxSpeed}
                onChange={(v) =>
                  updateChocoboStats(chocobo.id, { motherMaxSpeed: v })
                }
                color="red.600"
                disabled={!isEditMode}
              />
              <StatInput
                label="Acceleration"
                value={chocobo.stats.motherAcceleration}
                onChange={(v) =>
                  updateChocoboStats(chocobo.id, { motherAcceleration: v })
                }
                color="red.600"
                disabled={!isEditMode}
              />
              <StatInput
                label="Endurance"
                value={chocobo.stats.motherEndurance}
                onChange={(v) =>
                  updateChocoboStats(chocobo.id, { motherEndurance: v })
                }
                color="red.600"
                disabled={!isEditMode}
              />
              <StatInput
                label="Stamina"
                value={chocobo.stats.motherStamina}
                onChange={(v) =>
                  updateChocoboStats(chocobo.id, { motherStamina: v })
                }
                color="red.600"
                disabled={!isEditMode}
              />
              <StatInput
                label="Cunning"
                value={chocobo.stats.motherCunning}
                onChange={(v) =>
                  updateChocoboStats(chocobo.id, { motherCunning: v })
                }
                color="red.600"
                disabled={!isEditMode}
              />
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Card.Root>
  );
};
