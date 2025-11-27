import React from "react";
import {
  Box,
  Button,
  Card,
  Heading,
  Text,
  Grid,
  GridItem,
  VStack,
  HStack,
  Badge,
  Switch,
} from "@chakra-ui/react";
import { useChocoboStore } from "../store/chocoboStore";
import type { Chocobo } from "../schemas/chocobo";

const ChocoboStatsDisplay: React.FC<{ chocobo: Chocobo; title: string; color: string }> = ({
  chocobo,
  title,
  color,
}) => {
  return (
    <Box>
      <Heading size="md" mb={3} color={color}>
        {title}
      </Heading>

      <VStack align="stretch" gap={2}>
        {/* Father Stats */}
        <Box p={3} bg="blue.50" borderRadius="md">
          <Text fontWeight="bold" fontSize="sm" color="blue.700" mb={2}>
            Father's Stats
          </Text>
          <VStack align="stretch" gap={1} fontSize="sm">
            <HStack justify="space-between">
              <Text>Max Speed:</Text>
              <Text fontWeight="bold" color="blue.600">
                {"★".repeat(chocobo.stats.fatherMaxSpeed)}
                {"☆".repeat(5 - chocobo.stats.fatherMaxSpeed)}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Acceleration:</Text>
              <Text fontWeight="bold" color="blue.600">
                {"★".repeat(chocobo.stats.fatherAcceleration)}
                {"☆".repeat(5 - chocobo.stats.fatherAcceleration)}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Endurance:</Text>
              <Text fontWeight="bold" color="blue.600">
                {"★".repeat(chocobo.stats.fatherEndurance)}
                {"☆".repeat(5 - chocobo.stats.fatherEndurance)}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Stamina:</Text>
              <Text fontWeight="bold" color="blue.600">
                {"★".repeat(chocobo.stats.fatherStamina)}
                {"☆".repeat(5 - chocobo.stats.fatherStamina)}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Cunning:</Text>
              <Text fontWeight="bold" color="blue.600">
                {"★".repeat(chocobo.stats.fatherCunning)}
                {"☆".repeat(5 - chocobo.stats.fatherCunning)}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Mother Stats */}
        <Box p={3} bg="red.50" borderRadius="md">
          <Text fontWeight="bold" fontSize="sm" color="red.700" mb={2}>
            Mother's Stats
          </Text>
          <VStack align="stretch" gap={1} fontSize="sm">
            <HStack justify="space-between">
              <Text>Max Speed:</Text>
              <Text fontWeight="bold" color="red.600">
                {"★".repeat(chocobo.stats.motherMaxSpeed)}
                {"☆".repeat(5 - chocobo.stats.motherMaxSpeed)}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Acceleration:</Text>
              <Text fontWeight="bold" color="red.600">
                {"★".repeat(chocobo.stats.motherAcceleration)}
                {"☆".repeat(5 - chocobo.stats.motherAcceleration)}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Endurance:</Text>
              <Text fontWeight="bold" color="red.600">
                {"★".repeat(chocobo.stats.motherEndurance)}
                {"☆".repeat(5 - chocobo.stats.motherEndurance)}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Stamina:</Text>
              <Text fontWeight="bold" color="red.600">
                {"★".repeat(chocobo.stats.motherStamina)}
                {"☆".repeat(5 - chocobo.stats.motherStamina)}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Cunning:</Text>
              <Text fontWeight="bold" color="red.600">
                {"★".repeat(chocobo.stats.motherCunning)}
                {"☆".repeat(5 - chocobo.stats.motherCunning)}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Additional Info */}
        <HStack gap={2} flexWrap="wrap">
          {chocobo.grade && (
            <Badge colorScheme="purple" fontSize="sm">
              Grade {chocobo.grade}
            </Badge>
          )}
          {chocobo.ability && (
            <Badge colorScheme="green" fontSize="sm">
              {chocobo.ability}
            </Badge>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export const OptimalPair: React.FC = () => {
  const { optimalPair, findOptimalBreedingPair, getMaleChocobos, getFemaleChocobos, superSprint, setSuperSprint } =
    useChocoboStore();

  const males = getMaleChocobos();
  const females = getFemaleChocobos();
  const canCalculate = males.length > 0 && females.length > 0;

  return (
    <Box width="full" mb={8}>
      <VStack align="stretch" gap={4}>
        <Box textAlign="center">
          <Heading size="xl" mb={2}>
            FFXIV Chocobo Breeding Optimizer
          </Heading>
          <Text color="gray.600" fontSize="md">
            Find the optimal breeding pair from your chocobo collection
          </Text>
        </Box>

        {optimalPair ? (
          <Card.Root p={6} bg="green.50" borderWidth={2} borderColor="green.300">
            <VStack align="stretch" gap={4}>
              <Box textAlign="center">
                <Heading size="lg" color="green.700" mb={1}>
                  Best Pairing Found!
                </Heading>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  Score: {optimalPair.score.toFixed(2)}
                </Text>
              </Box>

              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                <GridItem>
                  <ChocoboStatsDisplay
                    chocobo={optimalPair.father}
                    title="The Father"
                    color="blue.600"
                  />
                </GridItem>
                <GridItem>
                  <ChocoboStatsDisplay
                    chocobo={optimalPair.mother}
                    title="The Mother"
                    color="red.600"
                  />
                </GridItem>
              </Grid>

              <HStack justify="space-between" align="center" width="full">
                <HStack>
                  <Switch.Root
                    checked={superSprint}
                    onCheckedChange={() => setSuperSprint(!superSprint)}
                    colorPalette="green"
                    aria-label="Toggle Super Sprint"
                  >
                    <Switch.Control
                      tabIndex={0}
                      onClick={() => setSuperSprint(!superSprint)}
                    >
                      <Switch.Thumb />
                    </Switch.Control>
                    <Switch.Label fontSize="sm" fontWeight="medium">
                      Super Sprint
                    </Switch.Label>
                  </Switch.Root>
                </HStack>
                <Button
                  onClick={findOptimalBreedingPair}
                  colorScheme="green"
                  size="lg"
                  flex="1"
                  ml={4}
                >
                  Recalculate Optimal Pair
                </Button>
              </HStack>
            </VStack>
          </Card.Root>
        ) : (
          <Card.Root p={6} bg="gray.50" borderWidth={2} borderColor="gray.300">
            <VStack align="stretch" gap={4}>
              <Box textAlign="center">
                <Heading size="md" color={canCalculate ? "gray.600" : "orange.600"} mb={2}>
                  {canCalculate
                    ? "No Optimal Pair Calculated Yet"
                    : "⚠️ You need at least one male and one female chocobo"}
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  Add your chocobos below and click the button to find the best breeding
                  pair
                </Text>
              </Box>

              <HStack justify="space-between" align="center" width="full">
                <HStack>
                  <Switch.Root
                    checked={superSprint}
                    onCheckedChange={() => setSuperSprint(!superSprint)}
                    colorPalette="blue"
                    aria-label="Toggle Super Sprint"
                  >
                    <Switch.Control
                      tabIndex={0}
                      onClick={() => setSuperSprint(!superSprint)}
                    >
                      <Switch.Thumb />
                    </Switch.Control>
                    <Switch.Label fontSize="sm" fontWeight="medium">
                      Super Sprint
                    </Switch.Label>
                  </Switch.Root>
                </HStack>
                <Button
                  onClick={findOptimalBreedingPair}
                  colorScheme="blue"
                  size="lg"
                  disabled={!canCalculate}
                  flex="1"
                  ml={4}
                >
                  Find Optimal Breeding Pair
                </Button>
              </HStack>
            </VStack>
          </Card.Root>
        )}
      </VStack>
    </Box>
  );
};
