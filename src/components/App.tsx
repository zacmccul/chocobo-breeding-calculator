import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  GridItem,
  HStack,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import { Download, Upload, Info } from "lucide-react";
import { OptimalPair } from "./OptimalPair";
import { ChocoboList } from "./ChocoboList";
import { SortControls } from "./SortControls";
import { FilterControls } from "./FilterControls";
import { InfoModal } from "./InfoModal";
import { useChocoboStore } from "../store/chocoboStore";

export const App: React.FC = () => {
  const { exportData, importData, hasSeenInfo, setHasSeenInfo } = useChocoboStore();
  const controlsRef = useRef<HTMLDivElement>(null);
  const controlsContainerRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (controlsContainerRef.current) {
        const rect = controlsContainerRef.current.getBoundingClientRect();
        // When the original position scrolls above the viewport, make it sticky
        setIsSticky(rect.top <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-open info modal on first visit
  useEffect(() => {
    if (!hasSeenInfo) {
      setIsInfoModalOpen(true);
    }
  }, [hasSeenInfo]);

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

  const handleInfoModalClose = () => {
    setIsInfoModalOpen(false);
    if (!hasSeenInfo) {
      setHasSeenInfo(true);
    }
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
            zIndex={1000}
            gap={2}
            bg="white"
            p={2}
            borderRadius="md"
            boxShadow="lg"
            borderWidth="2px"
            borderColor="blue.500"
          >
            <IconButton
              aria-label="Show information"
              onClick={() => setIsInfoModalOpen(true)}
              colorScheme="purple"
              title="Information & Help"
            >
              <Info size={20} />
            </IconButton>
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

          {/* Info Modal */}
          <InfoModal open={isInfoModalOpen} onClose={handleInfoModalClose} />

          {/* Optimal Pair Section */}
          <OptimalPair />

          {/* Controls Container - this marks where the controls should stick */}
          <Box ref={controlsContainerRef} position="relative">
            <VStack
              ref={controlsRef}
              align="stretch"
              gap={4}
              position={isSticky ? "fixed" : "relative"}
              top={isSticky ? 4 : "auto"}
              left={isSticky ? "50%" : "auto"}
              transform={isSticky ? "translateX(-50%)" : "none"}
              width={isSticky ? "min(calc(100% - 10rem), 1440px)" : "full"}
              zIndex={isSticky ? 100 : "auto"}
              transition="all 0.2s"
              marginInlineEnd={isSticky ? "8rem" : "0"}
            >
              {/* Sort Controls */}
              <SortControls />

              {/* Filter Controls */}
              <FilterControls />
            </VStack>
            
            {/* Spacer to prevent content jump when controls become fixed */}
            {isSticky && (
              <Box height={controlsRef.current?.offsetHeight || 0} />
            )}
          </Box>

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
