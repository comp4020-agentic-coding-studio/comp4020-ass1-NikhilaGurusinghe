"use client";

import { GameManagerTransitions } from "@/app/game/state/game-manager";
import { GameManagerContext } from "@/app/game/state/game-manager-context";

export default function MainMenu() {
  const actorRef = GameManagerContext.useActorRef();

  return (
    <div className="w-full flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-left">Exploited</h1>
      <p>The vast amounts of data that machine-learning algorithms require during training, 
        necessitates an unprecedented, planetary-scale extraction of knowledge and understanding from an
        underpaid, overworked, and exploited workforce of labourers toiling away for hours on end.</p>
      <p>
        The following “game” tries to simulate some of the this labour.
      </p>
      <p>
        Described as selling shovels during a gold rush, data labelling is a billion-dollar industry
        built upon the labour of these people and is the essential to many of the machine-learning-based
        producted - like LLMs - that we enjoy today.
      </p>
      <p> 
        Data labellers are often not in a position to speak about their work due to factors such as non-disclosure
        agreements associated with the work tha they do, as a result the labelling tasks you will attempt may
        not be completely accurate, nor will they be representative of the emotional and physical toll that real data labellers experience.
        However, all care has been taken to make these labelling tasks as accurate as possible from the disparate reporting that exists.
        Again, no experience can replicate the exploitation that these workers face.
      </p>
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
