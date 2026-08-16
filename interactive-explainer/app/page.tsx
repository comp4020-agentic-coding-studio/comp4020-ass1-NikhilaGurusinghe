"use client";

import FamilyScreen from "./components/family-screen/family-screen";
import MainMenu from "./components/main-menu";
import BoundingBox from "./components/minigames/bounding-box/bounding-box";
import Captcha from "./components/minigames/captcha/captcha";
import ToneRating from "./components/minigames/tone-rating/tone-rating";
import { GameManagerStates } from "./game/state/game-manager";
import { GameManagerContext } from "./game/state/game-manager-context";

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

  return (
    <>
      {isMainMenu && <MainMenu />}
      {isMinigame && (
        <>
          {/* <Captcha /> */}
          {/* <BoundingBox /> */}
          <ToneRating />
        </>
      )}
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
