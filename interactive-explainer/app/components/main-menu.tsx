"use client";

import { GameManagerTransitions } from "@/app/game/state/game-manager";
import { GameManagerContext } from "@/app/game/state/game-manager-context";

export default function MainMenu() {
  const actorRef = GameManagerContext.useActorRef();

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div>Main Menu</div>
      <button
        type="button"
        className="cursor-pointer rounded-md text-white w-full py-4 hover:bg-(--highlight-dark) bg-(--highlight-colour)"
        onClick={() => actorRef.send({ type: GameManagerTransitions.NEXT })}
      >
        Agree to terms and proceed to task
      </button>
    </div>
  );
}
