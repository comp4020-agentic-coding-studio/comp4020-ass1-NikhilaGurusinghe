import { assign, setup } from "xstate";
import {
  DefaultFamilyStats,
  type FamilyMemberStatChange,
  type FamilyStats,
} from "../types/family-stats";
import type { MinigameStats } from "../types/minigame-stats";

export enum GameManagerStates {
  MAIN_MENU = "MAIN_MENU_STATE",
  MINIGAME = "MINIGAME_STATE",
  FAMILY_SCREEN = "FAMILY_SCREEN_STATE",
}

export enum GameManagerTransitions {
  NEXT = "NEXT_STATE_TRANSTION",
}

function hasPreviousMinigameStats(
  event: unknown,
): event is { previousMinigameStats: MinigameStats } {
  return (
    typeof event === "object" &&
    event !== null &&
    "previousMinigameStats" in event
  );
}

function hasLeftoverSalary(
  event: unknown,
): event is { leftoverSalary: number } {
  return (
    typeof event === "object" && event !== null && "leftoverSalary" in event
  );
}

function hasfamilyHpChanges(
  event: unknown,
): event is { familyHpChanges: FamilyMemberStatChange[] } {
  return (
    typeof event === "object" && event !== null && "familyHpChanges" in event
  );
}

export const GameManager = setup({
  types: {
    context: {} as {
      savings: number;
      iteration: number; // used to determine which minigame to show next etc.
      previousMinigameStats: MinigameStats | undefined; // undefined initially
      familyStats: FamilyStats;
    },
    events: {} as
      | {
          // transition out of minigame state
          type: GameManagerTransitions.NEXT;
          previousMinigameStats: MinigameStats;
        }
      | {
          // transition out of family screen state
          type: GameManagerTransitions.NEXT;
          leftoverSalary: number; // this can be negative
          familyHpChanges: FamilyMemberStatChange[];
        }
      | {
          // transition out of main menu state
          type: GameManagerTransitions.NEXT;
        },
  },
}).createMachine({
  id: "GameManager",
  context: {
    savings: 0,
    iteration: 0,
    previousMinigameStats: undefined,
    familyStats: new DefaultFamilyStats(),
  },
  initial: GameManagerStates.MAIN_MENU,
  states: {
    [GameManagerStates.MAIN_MENU]: {
      on: {
        [GameManagerTransitions.NEXT]: {
          target: GameManagerStates.MINIGAME,
        },
      },
    },
    [GameManagerStates.MINIGAME]: {
      on: {
        // go to family screen and update previousMinigameStats
        [GameManagerTransitions.NEXT]: {
          target: GameManagerStates.FAMILY_SCREEN,
          actions: assign({
            previousMinigameStats: ({ event }) =>
              hasPreviousMinigameStats(event)
                ? event.previousMinigameStats
                : undefined,
          }),
        },
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
            savings: ({ context, event }) =>
              context.savings +
              (hasLeftoverSalary(event) ? event.leftoverSalary : 0),
            familyStats: ({ context, event }) =>
              hasfamilyHpChanges(event)
                ? context.familyStats.updateStats(event.familyHpChanges)
                : context.familyStats,
          }),
        },
      },
    },
  },
});
