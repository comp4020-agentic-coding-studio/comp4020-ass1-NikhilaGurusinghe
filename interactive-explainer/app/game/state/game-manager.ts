import { assign, createMachine, setup } from "xstate";
import { MinigameStats } from "../types/minigame-stats";
import { DefaultFamilyStats, FamilyStats } from "../types/family-stats";

enum GameManagerStates {
  MAIN_MENU = "MAIN_MENU_STATE",
  MINIGAME = "MINIGAME_STATE",
  FAMILY_SCREEN = "FAMILY_SCREEN_STATE",
}

enum GameManagerTransitions {
  NEXT = "NEXT_STATE_TRANSTION"
}

export const gameManager = setup({
  types: {
    context: {} as {
      savings: number;
      iteration: number; // used to determine which minigame to show next etc.
      previousMinigameStats: MinigameStats | undefined; // undefined initially
      familyStats: FamilyStats;
    },
    events: {} as | 
    { 
      type: GameManagerTransitions.NEXT,
      // previousMinigameStats is used when transitioning out of the minigame state
      previousMinigameStats?: MinigameStats, 
    } |
    { 
      type: GameManagerTransitions.NEXT,
      // leftoverSalary is used to update savings when transitioning out of 
      leftoverSalary?: number 
    } 
  },
}).createMachine({
  id: "gameManager",
  context: {
		savings: 0,
    iteration: 0,
    previousMinigameStats: undefined,
    familyStats: new DefaultFamilyStats,
	},
  initial: GameManagerStates.MAIN_MENU,
  states: {
    [GameManagerStates.MAIN_MENU]: {
      on: {
        [GameManagerTransitions.NEXT]: {
          target: GameManagerStates.MINIGAME,
        }
      },
    },
    [GameManagerStates.MINIGAME]: {
      on: {
        // go to family screen and update previousMinigameStats
        [GameManagerTransitions.NEXT]: {
          target: GameManagerStates.FAMILY_SCREEN,
          actions: assign({
            previousMinigameStats: ({ event }) => event.previousMinigameStats,
          }),
        }
      },
    }, 
    [GameManagerStates.FAMILY_SCREEN]: {
      on: {
        // go to minigame state and increment iteration, 
        // plus update leftover salary incremented to savings 
        [GameManagerTransitions.NEXT]: {
          target: GameManagerStates.MINIGAME,
          actions: assign({
            iteration: ({ context }) => context.iteration + 1,
          }),
        }
      },
    },
  },
});