"use client";

import { useState } from "react";
import FamilyScreen from "./components/family-screen/family-screen";
import MainMenu from "./components/main-menu";
import BoundingBox from "./components/minigames/bounding-box/bounding-box";
import Captcha from "./components/minigames/captcha/captcha";
import ToneRating from "./components/minigames/tone-rating/tone-rating";
import { GameManagerStates } from "./game/state/game-manager";
import { GameManagerContext } from "./game/state/game-manager-context";

// one entry per minigame - shuffled once per game below so each is played on
// exactly one day, in a random order, and never repeats
const MINIGAMES: React.ComponentType[] = [Captcha, BoundingBox, ToneRating];

function GameScreen() {
  // the various states of the game that we use to activate/deactivate divs
  const isMainMenu: boolean = GameManagerContext.useSelector((state) =>
    state.matches(GameManagerStates.MAIN_MENU),
  );
  const isMinigame: boolean = GameManagerContext.useSelector((state) =>
    state.matches(GameManagerStates.MINIGAME),
  );
  const isFamilyScreen: boolean = GameManagerContext.useSelector((state) =>
    state.matches(GameManagerStates.FAMILY_SCREEN),
  );
  const iteration: number = GameManagerContext.useSelector(
    (state) => state.context.iteration,
  );

  // shuffled once per mount (matches the same sort-by-random idiom already
  // used for per-minigame asset ordering), not re-shuffled on every render
  const [minigameOrder] = useState<React.ComponentType[]>(() =>
    [...MINIGAMES].sort(() => Math.random() - 0.5),
  );
  const ActiveMinigame =
    minigameOrder[iteration] ?? minigameOrder[minigameOrder.length - 1];

  return (
    <>
      {isMainMenu && <MainMenu />}
      {isMinigame && <ActiveMinigame />}
      {isFamilyScreen && <FamilyScreen />}
    </>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <GameManagerContext.Provider>
          <GameScreen />
        </GameManagerContext.Provider>
      </main>
    </div>
  );
}
