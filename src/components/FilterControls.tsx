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
} from "@chakra-ui/react";
import { Filter, X, Plus } from "lucide-react";
import { useChocoboStore, type StatName, type StatParent, type StatFilter } from "../store/chocoboStore";

const statDisplayNames: Record<StatName, string> = {
  maxSpeed: "Max Speed",
  acceleration: "Acceleration",
  endurance: "Endurance",
  stamina: "Stamina",
  cunning: "Cunning",
};

export const FilterControls: React.FC = () => {
  const { statFilters, addStatFilter, removeStatFilter, clearAllFilters } = useChocoboStore();
  
  const [selectedStat, setSelectedStat] = useState<StatName>("maxSpeed");
  const [selectedParent, setSelectedParent] = useState<StatParent>("one");
  const [selectedValue, setSelectedValue] = useState<number>(5);
  const [showAddFilter, setShowAddFilter] = useState(false);

  const handleAddFilter = () => {
    addStatFilter({
      stat: selectedStat,
      parent: selectedParent,
      minValue: selectedValue,
    });
    setShowAddFilter(false);
  };

  const formatFilterLabel = (filter: StatFilter) => {
    const statName = statDisplayNames[filter.stat];
    const countLabel = filter.parent === "all" ? "All" : "One";
    return `${statName} - ${countLabel} >= ${filter.minValue}`;
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
                      value={selectedValue}
                      onChange={(e) => setSelectedValue(parseInt(e.target.value))}
                    >
                      <option value={1}>1★</option>
                      <option value={2}>2★</option>
                      <option value={3}>3★</option>
                      <option value={4}>4★</option>
                      <option value={5}>5★</option>
                    </NativeSelectField>
                  </NativeSelectRoot>
                </HStack>

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
            No filters applied. Click "Add Filter" to filter chocobos by stats.
          </Text>
        )}
      </VStack>
    </Box>
  );
};
