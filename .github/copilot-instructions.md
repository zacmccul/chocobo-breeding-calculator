# Project Goal
A React static index.html built on vite to provide a github io web interface for determining optimal chocobo breeding in Final Fantasy XIV.

# Features
- 100% contained in a single index.html file.
- Ability to export chocobo data as JSON file.
- Ability to import character data from JSON files.
- All inputs are saved to local storage using zustand.

# Chocobos Sheet Details for Saving
Need to be able to import a list of chocobos with the following details:
The following are fields that need to be saved and exportable. Use Zod for schema validation.
- Stats (two sets, blue and red color, ranging from 1-5)
  - Maximum Speed
  - Acceleration
  - Endurance
  - Stamina
  - Cunning
- Gender (enum)
- Grade (optional)
- Ability (optional enum)

# Visual Character Sheet Requirements
- At the top have the title "FFXIV Chocobo Breeding Optimizer" with a small description below it.
- Additionally have an optimal breeding pair which has a nice empty state, with right below it a "Find Optimal Breeding Pair" button.
  - When that button is clicked it calculates the optimal breeding pair from the chocobos listed below and displays them in the optimal breeding pair section.
- Below that have the chocobo list area.
- Two column layout, left side for males, right side for females.
- Full tab/arrow key navigation support
- Clean simple scalable UI using chakra v3 components
- Ability to display and edit all chocobo sheet details listed above
- Floating island buttons in the top right to import/export JSON files
- A button to add new chocobo entries for each column (male/female)
- Sort by chocobo quality (stat total) within each column
- Filter by a particular ability using a dropdown, results in a chip showing the active filter that is clearable. For example "Add Filter -> Ability Racing: at least 3". Can add many filters.
- For each column (male/female), have an empty state message when there are no chocobos to display.
- Each chocobo entry should have a delete button to remove it from the list w/ confirm.
- Form validation to ensure stats are within range, required fields are filled, etc.

# Chocobo UI
- Each chocobo should be its own card.
- Each chocobo should display its stats in a two column format using blue on the left and red on the right for stats, represented via stars, with text inputs for setting them.
Elements:
- Gender toggle switch which changes the border color (light blue/red), and the color of the switch (same), from Male to Female.
To the right in the same row,
- Grade text input (optional) 1-9.
A delete button in the upper right corner of the card.
- The next row is a text/dropdown with search for Ability that is optional.
- Below that row is a two column stat format with the following stats:
  - Maximum Speed
  - Acceleration
  - Endurance
  - Stamina
  - Cunning
- And within a column it has a text input with up/down arrows to set the stat from 1-5, and next to it a star representation of the stat value (1-5 stars filled in).

# Technologies
- Use Vite and React for the web interface
- Use TypeScript for type safety
- chakra v3 for UI components
- pnpm for package management
- Zod for schema validation
- zustand for state management
- vitest for testing

# TypeScript
- Use TypeScript for all new code
- Follow functional programming principles where possible
- Use interfaces for data structures and type definitions
- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators

## React Guidelines
- Use functional components with hooks
- Follow the React hooks rules (no conditional hooks)
- Use React.FC type for components with children
- Keep components small and focused

# Testing
Always use vitest for unit tests.

# Tips
DO NOT USE REQUIRE. ONLY IMPORT.