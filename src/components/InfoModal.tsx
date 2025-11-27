import React from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  List,
  Code,
} from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogBackdrop,
  Portal,
} from "@chakra-ui/react";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ open, onClose }) => {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => {
        if (!e.open) {
          onClose();
        }
      }}
      size="xl"
      scrollBehavior="inside"
      lazyMount
      unmountOnExit
    >
      <Portal>
        <DialogBackdrop />
        <DialogContent 
          maxH="90vh" 
          width="90vw"
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={1500}
        >
        <DialogHeader>
          <Heading size="lg">Welcome to the FFXIV Chocobo Breeding Calculator</Heading>
        </DialogHeader>
        <DialogCloseTrigger />
        <DialogBody overflowY="auto">
          <VStack align="stretch" gap={6} pb={4}>
            <Box>
              <Heading size="md" mb={2}>
                What is this tool?
              </Heading>
              <Text mb={3}>
                This calculator helps you optimize your chocobo breeding in Final Fantasy XIV by
                minimizing the number of chocobos you need to rank up to 40 to get your perfect 50 star chocobo.
                Track your chocobos here and determine the best pairings. 
                This is solely aimed at stat optimization and ignores Grades.
              </Text>
              <Text fontSize="sm" color="gray.600" fontStyle="bold">
                This welcome screen displays automatically on your first visit. You can view it again anytime by clicking the black information button in the top right corner of the page.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>
                Getting Started
              </Heading>
              <List.Root gap={3}>
                <List.Item>
                  <Text fontWeight="semibold">Add Your Chocobos:</Text>
                  <Text ml={4}>
                    Use the <Code>+ Add Male</Code> and <Code>+ Add Female</Code> buttons to create
                    entries for your chocobos. Each card represents one chocobo.
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fontWeight="semibold">Enter Chocobo Stats:</Text>
                  <Text ml={4}>
                    For each chocobo, input the inherited stats from both parents (shown in blue
                    for father and red for mother in-game).
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fontWeight="semibold">Optional Fields:</Text>
                  <Text ml={4}>
                    You can also add the chocobo's Grade (1-9) to help distinguish and special Ability (like Choco
                    Dash, Super Sprint, etc.) for filtering.
                  </Text>
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading size="md" mb={2}>
                Finding Optimal Pairs
              </Heading>
              <Text mb={3}>
                Once you've added your chocobos, click the <Code>Find Optimal Breeding Pair</Code>{" "}
                button at the top. The calculator will evaluate all possible male-female
                combinations and display the best pair based on their genetic potential.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>
                Sorting & Filtering
              </Heading>
              <List.Root gap={3}>
                <List.Item>
                  <Text fontWeight="semibold">Sort Options:</Text>
                  <Text ml={4}>
                    Sort your chocobos by Quality (total stats), Locked Stats (5-star stats from
                    both parents), or Five Star Stats (any 5-star stats). Choose ascending or
                    descending order.
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fontWeight="semibold">Filters:</Text>
                  <Text ml={4}>
                    Add filters to show only chocobos meeting specific criteria. For example,
                    filter for chocobos with "Endurance: at least 4 stars from one parent" or
                    "Maximum Speed: at least 5 stars from all parents."
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fontWeight="semibold">Edit Mode:</Text>
                  <Text ml={4}>
                    Toggle Edit Mode to manually reorder your chocobos by dragging them. The order
                    is preserved until you exit edit mode or change filters.
                  </Text>
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading size="md" mb={2}>
                Import & Export
              </Heading>
              <Text mb={2}>
                Your data is automatically saved in your browser's local storage, no data leaves your computer. This means unless you clear your cache, as long as you access this site from the same device and browser you can always access your data. You can
                also:
              </Text>
              <List.Root gap={2}>
                <List.Item>
                  <Text fontWeight="semibold">Export:</Text>
                  <Text ml={4}>
                    Click the black download icon in the top right corner to save your chocobo data as a JSON file for backup or
                    sharing.
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fontWeight="semibold">Import:</Text>
                  <Text ml={4}>
                    Click the black upload icon in the top right corner to load chocobo data from a previously exported JSON
                    file.
                  </Text>
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading size="md" mb={3}>
                How Chocobo Breeding Works
              </Heading>
              
              <Heading size="sm" mb={2}>
                Understanding Stat Inheritance
              </Heading>
              <Text mb={3}>
                When a Fledgling chocobo is registered, their stats are randomly picked between their parents' stat sets, visible on their in-game item. When a chocobo is bred, they inherit two stat sets, one from each parent. These stat sets are determined by a coin flip of the parent's two inherited stat sets.
              </Text>
              <Text mb={3}>
                For example, a chocobo that has parental stats of 5 and 1 stars for a given stat could end up with either 5 or 1 star in that stat when registered. Importantly, a fledgling inherits from their father's two inherited stat sets (coin flipped for each stat), and similarly from the mother. In other words, a fledgling chocobo's race statistics are determined by their parents' inherited stat sets, not the parents' own racing stats.
              </Text>
              <Text mb={4}>
                The ultimate goal of chocobo breeding is to have 5 stars in each stat inherited from both the mother and father. When this is achieved, the chocobo will always have 5 stars in each stat when registered or bred.
              </Text>

              <Heading size="sm" mb={2}>
                What Makes This Calculator Different?
              </Heading>
              <Text mb={3}>
                This calculator does not minimize the number of breeding attempts to get a perfect chocobo. Rather, it takes advantage of the fact you can breed a pair 9 times to maximize your chances of getting a high quality chocobo while minimizing how many chocobos you need to rank up to 40.
              </Text>
              <Text mb={3}>
                This means most chocobo breeding will involve breeding the same pair multiple times until you hit the limit or get a higher quality chocobo. Since breeding and picking up a chocobo takes only ~2 minutes with a timer, even 9 breedings is a fraction of the time needed to rank a chocobo to 40.
              </Text>
              
              <Heading size="sm" mb={2} mt={4}>
                Why Unbalanced Stats Matter
              </Heading>
              <Text mb={3}>
                You may notice the calculator sometimes prioritizes lower stats when a 5-star pairing isn't possible. This is strategic: when ranking up a chocobo, you want to minimize MGP spent on attribute increases by having the most important stats (Max Speed and Stamina) very high and less important ones (Cunning and Acceleration) very low.
              </Text>
              <Text mb={3}>
                As your chocobo ranks up, it gains stats randomly based on its star ratings. While normally more stars would be better, you'll face increasingly challenging races (R80, R120, etc.). By focusing stat gains only on the most important attributes, you ensure maximum speed for your rank, which maximizes your win rate. Win rate is the most important factor for ranking to 40 faster, and unbalanced stat distribution is key.
              </Text>
              <Text mb={4}>
                However, we still prioritize 5 stars in as many stats as possible to minimize generations needed. Once you have chocobos with 5 stars in all stats from at least one parent, you can inbreed to get your perfect chocobo.
              </Text>

              <Heading size="sm" mb={2}>
                How the Calculator Works
              </Heading>
              <Text mb={4}>
                The calculator simulates all 3,125 possible children (5 possibilities for each of the 5 stats: 5×5×5×5×5 = 3,125) and ranks them from worst to best. Then it calculates the expected quality of the best offspring if you bred that pair multiple times, up to the number of remaining coverings left.
              </Text>

              <Heading size="sm" mb={2}>
                Ranking Criteria: What Makes a Chocobo "Better"?
              </Heading>
              <List.Root gap={3} mb={3}>
                <List.Item>
                  <Text fontWeight="semibold">Priority #1 - Stats with at least one 5-star:</Text>
                  <Text ml={4}>
                    These give you a chance to eventually breed perfect offspring. Without any 5-star in a stat, you can never reach perfection in that attribute.
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fontWeight="semibold">Priority #2 - "Locked" stats (both parents have 5 stars):</Text>
                  <Text ml={4}>
                    These guarantee at least one 5-star for their children in that stat.
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fontWeight="semibold">Priority #3 - Racing formula optimization:</Text>
                  <Text ml={4}>
                    A special formula balances the racing stats. Max Speed and Stamina are most valuable, while Cunning and Acceleration are less important. Endurance serves as a tiebreaker.
                  </Text>
                </List.Item>
              </List.Root>
              <Text>
                <Text as="span" fontWeight="semibold">Example:</Text> A chocobo with stats like [5,1], [1,5], [5,1] is considered better than [5,5], [5,5], [3,4]. Why? When breeding 9 offspring, the first has high odds of producing a child that receives all three 5-stars from the parent, while the second is guaranteed only 2 five-stars maximum.
              </Text>
            </Box>

            <Box borderTopWidth="1px" pt={4}>
              <Text fontSize="sm" color="gray.600">
                Final Fantasy XIV and Chocobo are registered trademarks of Square Enix Co., Ltd. This project is an unofficial fan creation used for entertainment purposes under Fair Use; it is not affiliated with or endorsed by Square Enix.
              </Text>
            </Box>
          </VStack>
        </DialogBody>
      </DialogContent>
      </Portal>
    </DialogRoot>
  );
};
