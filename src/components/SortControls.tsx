import React from "react";
import { Box, HStack, Text, NativeSelectRoot, NativeSelectField } from "@chakra-ui/react";
import { Switch } from "@chakra-ui/react";
import { useChocoboStore, type SortType, type SortOrder } from "../store/chocoboStore";
import { ArrowUpDown, Edit3 } from "lucide-react";

export const SortControls: React.FC = () => {
  const { sortType, sortOrder, isEditMode, setSortType, setSortOrder, setEditMode } = useChocoboStore();

  const handleSortTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortType(event.target.value as SortType);
  };

  const handleSortOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value as SortOrder);
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
      <HStack gap={4} align="center" flexWrap="wrap">
        <HStack gap={2}>
          <ArrowUpDown size={20} />
          <Text fontWeight="semibold" fontSize="sm">
            Sort By:
          </Text>
        </HStack>

        <NativeSelectRoot width="auto" size="sm" disabled={isEditMode}>
          <NativeSelectField
            value={sortType}
            onChange={handleSortTypeChange}
            borderRadius="md"
          >
            <option value="quality">Quality (Stat Total)</option>
            <option value="locked">Locked Stats (5★ Blue & Red)</option>
            <option value="fiveStars">Total 5★ Stats</option>
          </NativeSelectField>
        </NativeSelectRoot>

        <NativeSelectRoot width="auto" size="sm" disabled={isEditMode}>
          <NativeSelectField
            value={sortOrder}
            onChange={handleSortOrderChange}
            borderRadius="md"
          >
            <option value="desc">Highest First</option>
            <option value="asc">Lowest First</option>
          </NativeSelectField>
        </NativeSelectRoot>

        <Box
          borderLeftWidth={1}
          borderColor="gray.300"
          pl={4}
          ml={2}
          height="40px"
          display="flex"
          alignItems="center"
        >
          <HStack gap={3}>
            <HStack gap={2}>
              <Edit3 size={18} />
              <Text fontWeight="semibold" fontSize="sm">
                Edit Mode:
              </Text>
            </HStack>
            <Switch.Root
              checked={isEditMode}
              onCheckedChange={(details) => setEditMode(details.checked)}
              colorPalette={isEditMode ? "green" : "gray"}
              size="sm"
            >
              <Switch.Control
                tabIndex={0}
                onClick={() => {
                  setEditMode(!isEditMode);
                }}
              >
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Root>
          </HStack>
        </Box>
      </HStack>
    </Box>
  );
};
