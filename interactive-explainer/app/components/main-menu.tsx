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
        className="cursor-pointer"
        onClick={() => actorRef.send({ type: GameManagerTransitions.NEXT })}
      >
        start
      </button>
    </div>
  );
}
