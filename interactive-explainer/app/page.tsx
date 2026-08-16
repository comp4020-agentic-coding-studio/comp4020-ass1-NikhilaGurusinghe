"use client";

import { useActorRef, useSelector } from "@xstate/react";
import MainMenu from "./components/main-menu";
import BoundingBox from "./components/minigames/bounding-box/bounding-box";
import Captcha from "./components/minigames/captcha/captcha";
import ToneRating from "./components/minigames/tone-rating/tone-rating";
import { GameManager, GameManagerStates } from "./game/state/game-manager";

export default function Home() {
  // our state machine
  const actorRef = useActorRef(GameManager);

  // the various states of the game that we use to activate/deactivate divs
  const isMainMenu: boolean = useSelector(actorRef, (state) =>
    state.matches(GameManagerStates.MAIN_MENU),
  );
  const isMinigame: boolean = useSelector(actorRef, (state) =>
    state.matches(GameManagerStates.MINIGAME),
  );
  const isFamilyScreen: boolean = useSelector(actorRef, (state) =>
    state.matches(GameManagerStates.FAMILY_SCREEN),
  );
  const currGameIteration: number = useSelector(
    actorRef,
    (state) => state.context.iteration,
  );

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        {/* {isMainMenu && <MainMenu />}
        <div>
          {currGameIteration}
        </div> */}
        {/* <Captcha /> */}
        {/* <BoundingBox /> */}
        <ToneRating />
      </main>
    </div>
  );
}
