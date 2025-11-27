import React, { useState } from "react";
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  NativeSelectRoot,
  NativeSelectField,
  IconButton,
  Input,
} from "@chakra-ui/react";
import { Filter, X, Plus } from "lucide-react";
import { useChocoboStore, type StatName, type StatParent, type StatFilter, type FilterType } from "../store/chocoboStore";
import type { ChocoboAbility } from "../schemas/chocobo";

const statDisplayNames: Record<StatName, string> = {
  maxSpeed: "Max Speed",
  acceleration: "Acceleration",
  endurance: "Endurance",
  stamina: "Stamina",
  cunning: "Cunning",
};

const chocoboAbilities: (ChocoboAbility | "None")[] = [
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
  "None",
];

export const FilterControls: React.FC = () => {
  const { statFilters, addStatFilter, removeStatFilter, clearAllFilters } = useChocoboStore();
  
  const [filterType, setFilterType] = useState<FilterType>("stat");
  const [selectedStat, setSelectedStat] = useState<StatName>("maxSpeed");
  const [selectedParent, setSelectedParent] = useState<StatParent>("one");
  const [selectedStatValue, setSelectedStatValue] = useState<number>(5);
  const [selectedGrade, setSelectedGrade] = useState<number>(9);
  const [selectedAbility, setSelectedAbility] = useState<ChocoboAbility | "None">("None");
  const [showAddFilter, setShowAddFilter] = useState(false);

  const handleAddFilter = () => {
    if (filterType === "stat") {
      addStatFilter({
        type: "stat",
        stat: selectedStat,
        parent: selectedParent,
        minValue: selectedStatValue,
      } as Omit<StatFilter, "id">);
    } else if (filterType === "grade") {
      addStatFilter({
        type: "grade",
        minValue: selectedGrade,
      } as Omit<StatFilter, "id">);
    } else if (filterType === "ability") {
      addStatFilter({
        type: "ability",
        ability: selectedAbility,
      } as Omit<StatFilter, "id">);
    }
    setShowAddFilter(false);
  };

  const formatFilterLabel = (filter: StatFilter) => {
    if (filter.type === "stat") {
      const statName = statDisplayNames[filter.stat];
      const countLabel = filter.parent === "all" ? "All" : "One";
      return `${statName} - ${countLabel} >= ${filter.minValue}★`;
    } else if (filter.type === "grade") {
      return `Grade >= ${filter.minValue}`;
    } else if (filter.type === "ability") {
      return `Ability: ${filter.ability}`;
    }
    return "";
  };

  return (
    <Box
      p={4}
      bg="white"
      borderRadius="md"
      boxShadow="sm"
      borderWidth={1}
      borderColor="gray.200"
    >
      <VStack align="stretch" gap={3}>
        {/* Header Row */}
        <HStack gap={3} align="center" flexWrap="wrap">
          <HStack gap={2}>
            <Filter size={20} />
            <Text fontWeight="semibold" fontSize="sm">
              Filters:
            </Text>
          </HStack>

          {!showAddFilter && (
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => setShowAddFilter(true)}
            >
              <Plus size={16} />
              Add Filter
            </Button>
          )}

          {statFilters.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </HStack>

        {/* Add Filter Form */}
        {showAddFilter && (
          <Box
            p={3}
            bg="gray.50"
            borderRadius="md"
            borderWidth={1}
            borderColor="gray.200"
          >
            <VStack align="stretch" gap={3}>
              <HStack gap={2} flexWrap="wrap">
                {/* Filter Type Selector */}
                <NativeSelectRoot width="auto" size="sm">
                  <NativeSelectField
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                  >
                    <option value="stat">Stat</option>
                    <option value="grade">Grade</option>
                    <option value="ability">Ability</option>
                  </NativeSelectField>
                </NativeSelectRoot>

                {/* Conditional inputs based on filter type */}
                {filterType === "stat" && (
                  <>
                    <NativeSelectRoot width="auto" size="sm">
                      <NativeSelectField
                        value={selectedStat}
                        onChange={(e) => setSelectedStat(e.target.value as StatName)}
                      >
                        <option value="maxSpeed">Max Speed</option>
                        <option value="acceleration">Acceleration</option>
                        <option value="endurance">Endurance</option>
                        <option value="stamina">Stamina</option>
                        <option value="cunning">Cunning</option>
                      </NativeSelectField>
                    </NativeSelectRoot>

                    <NativeSelectRoot width="auto" size="sm">
                      <NativeSelectField
                        value={selectedParent}
                        onChange={(e) => setSelectedParent(e.target.value as StatParent)}
                      >
                        <option value="one">One Parent</option>
                        <option value="all">Both (All)</option>
                      </NativeSelectField>
                    </NativeSelectRoot>

                    <HStack gap={1}>
                      <Text fontSize="sm">≥</Text>
                      <NativeSelectRoot width="auto" size="sm">
                        <NativeSelectField
                          value={selectedStatValue}
                          onChange={(e) => setSelectedStatValue(parseInt(e.target.value))}
                        >
                          <option value={1}>1★</option>
                          <option value={2}>2★</option>
                          <option value={3}>3★</option>
                          <option value={4}>4★</option>
                          <option value={5}>5★</option>
                        </NativeSelectField>
                      </NativeSelectRoot>
                    </HStack>
                  </>
                )}

                {filterType === "grade" && (
                  <HStack gap={1}>
                    <Text fontSize="sm">≥</Text>
                    <Input
                      type="number"
                      size="sm"
                      width="70px"
                      min={1}
                      max={9}
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(parseInt(e.target.value) || 1)}
                    />
                  </HStack>
                )}

                {filterType === "ability" && (
                  <NativeSelectRoot width="auto" size="sm">
                    <NativeSelectField
                      value={selectedAbility}
                      onChange={(e) => setSelectedAbility(e.target.value as ChocoboAbility | "None")}
                    >
                      {chocoboAbilities.map((ability) => (
                        <option key={ability} value={ability}>
                          {ability}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                )}

                <Button size="sm" colorScheme="green" onClick={handleAddFilter}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddFilter(false)}
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Filter Chips */}
        {statFilters.length > 0 && (
          <HStack gap={2} flexWrap="wrap">
            {statFilters.map((filter) => (
              <HStack
                key={filter.id}
                px={3}
                py={1}
                bg="blue.100"
                borderRadius="full"
                borderWidth={1}
                borderColor="blue.300"
                gap={2}
              >
                <Text fontSize="sm" fontWeight="medium" color="blue.800">
                  {formatFilterLabel(filter)}
                </Text>
                <IconButton
                  aria-label="Remove filter"
                  size="xs"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={() => removeStatFilter(filter.id)}
                >
                  <X size={14} />
                </IconButton>
              </HStack>
            ))}
          </HStack>
        )}

        {statFilters.length === 0 && !showAddFilter && (
          <Text fontSize="sm" color="gray.500">
            No filters applied. Click "Add Filter" to filter chocobos by stats, grade, or ability.
          </Text>
        )}
      </VStack>
    </Box>
  );
};
