import React from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  HStack,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import { Download, Upload } from "lucide-react";
import { OptimalPair } from "./OptimalPair";
import { ChocoboList } from "./ChocoboList";
import { useChocoboStore } from "../store/chocoboStore";

export const App: React.FC = () => {
  const { exportData, importData } = useChocoboStore();

  const handleExport = () => {
    try {
      const jsonData = exportData();
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chocobo-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(
        `Failed to export data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        importData(text);
        alert("Data imported successfully!");
      } catch (error) {
        alert(
          `Failed to import data: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    };
    input.click();
  };

  return (
    <Box minHeight="100vh" bg="gray.50" py={8}>
      <Container maxWidth="7xl">
        <VStack align="stretch" gap={8}>
          {/* Floating Action Buttons */}
          <HStack
            position="fixed"
            top={4}
            right={4}
            zIndex={10}
            gap={2}
            bg="white"
            p={2}
            borderRadius="md"
            boxShadow="lg"
          >
            <IconButton
              aria-label="Export chocobos"
              onClick={handleExport}
              colorScheme="green"
              title="Export to JSON"
            >
              <Download size={20} />
            </IconButton>
            <IconButton
              aria-label="Import chocobos"
              onClick={handleImport}
              colorScheme="blue"
              title="Import from JSON"
            >
              <Upload size={20} />
            </IconButton>
          </HStack>

          {/* Optimal Pair Section */}
          <OptimalPair />

          {/* Chocobo Lists */}
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={8}
            width="full"
          >
            <GridItem>
              <ChocoboList gender="male" />
            </GridItem>
            <GridItem>
              <ChocoboList gender="female" />
            </GridItem>
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};
