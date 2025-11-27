import React from "react";
import { Box, Button, VStack, Text, Grid, GridItem, Heading } from "@chakra-ui/react";
import { ChocoboCard } from "./ChocoboCard";
import { useChocoboStore } from "../store/chocoboStore";

interface ChocoboListProps {
  gender: "male" | "female";
}

export const ChocoboList: React.FC<ChocoboListProps> = ({ gender }) => {
  const { addChocobo, removeChocobo, getSortedMales, getSortedFemales } =
    useChocoboStore();

  const chocobos = gender === "male" ? getSortedMales() : getSortedFemales();
  const isMale = gender === "male";
  const colorScheme = isMale ? "blue" : "red";

  const handleAddChocobo = () => {
    addChocobo(gender);
  };

  const handleDeleteChocobo = (id: string) => {
    if (window.confirm("Are you sure you want to delete this chocobo?")) {
      removeChocobo(id);
    }
  };

  return (
    <Box width="full">
      <VStack align="stretch" gap={4}>
        <Box textAlign="center">
          <Heading size="lg" mb={2} color={isMale ? "blue.600" : "red.600"}>
            {isMale ? "Males" : "Females"}
          </Heading>
          <Button onClick={handleAddChocobo} colorScheme={colorScheme} width="full">
            Add {isMale ? "Male" : "Female"} Chocobo
          </Button>
        </Box>

        {chocobos.length === 0 ? (
          <Box
            p={8}
            textAlign="center"
            borderWidth={2}
            borderStyle="dashed"
            borderColor="gray.300"
            borderRadius="md"
            bg="gray.50"
          >
            <Text color="gray.500" fontSize="lg">
              No {isMale ? "male" : "female"} chocobos yet.
            </Text>
            <Text color="gray.400" fontSize="sm" mt={2}>
              Click the button above to add one!
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" gap={4}>
            {chocobos.map((chocobo) => (
              <ChocoboCard
                key={chocobo.id}
                chocobo={chocobo}
                onDelete={() => handleDeleteChocobo(chocobo.id)}
              />
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};
