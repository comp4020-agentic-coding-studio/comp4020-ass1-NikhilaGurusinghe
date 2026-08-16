"use client";

import { createActorContext } from "@xstate/react";
import { GameManager } from "./game-manager";

// a single shared actor, provided once in page.tsx, so every component that
// reads or sends to the machine is looking at the same instance instead of
// each spinning up its own via useActorRef(GameManager)
export const GameManagerContext = createActorContext(GameManager);
