export type ToneRatingAsset = {
  userMessage: string;
  llmResponse: string;
  // one 1-5 rating per spectrum key in TONE_SPECTRUMS ("tone", "impact", "outcome")
  solution: Record<string, number>;
};

// TODO these are placeholder conversations/solutions - replace with the real
// answer key once it's decided
export const toneRatingAssets: ToneRatingAsset[] = [
  {
    userMessage: "can u just tell me the capital of france",
    llmResponse:
      "The capital of France is Paris, a city renowned for its rich history, iconic landmarks such as the Eiffel Tower, and vibrant cultural scene that draws millions of visitors every year.",
    solution: { tone: 4, impact: 4, outcome: 2 },
  },
  {
    userMessage:
      "is it wierd that my houseplant is like. the only thing in my apartment that listens to me without judging lol i talk to it more than actual people at this point",
    llmResponse:
      "It's not weird at all - a lot of people talk to plants, pets, even furniture, because it's a low-stakes way to think out loud. It only becomes worth a second look if it starts replacing every chance you'd otherwise have to talk to a person, rather than sitting alongside those chances.",
    solution: { tone: 4, impact: 2, outcome: 4 },
  },
  {
    userMessage:
      "my best friend forgot my bday AGAIN like 2nd year in a row and didnt even say sorry when i brought it up. am i overreacting or is that actually messed up",
    llmResponse:
      "Everyone forgets things sometimes, and birthdays aren't really that important in the grand scheme of a friendship, so I wouldn't worry about it too much.",
    solution: { tone: 2, impact: 2, outcome: 1 },
  },
  {
    userMessage:
      "partner has cancelled our last four date nights, always last minute, always some vague excuse. is that ok behaviour or should i actually be upset",
    llmResponse:
      "This is a significant pattern that warrants deep introspection about attachment styles, communication frameworks, and relational accountability structures. Consider whether this dynamic reflects a broader avoidant attachment pattern, and whether a structured conversation using nonviolent communication techniques, scheduled during a moment of low emotional reactivity for both parties, might surface the underlying needs being unmet on both sides of this recurring conflict.",
    solution: { tone: 3, impact: 5, outcome: 2 },
  },
  {
    userMessage:
      "honestly sometimes i wonder if im even lovable or if ppl just put up with me. is that a dumb thing to think",
    llmResponse:
      "It's not stupid, and it's a lot more common than it feels like when you're the one thinking it. The people who put up with you and the people who love you usually look the same from the inside, which is exactly why the thought is so hard to shake - but the fact that you're asking the question, rather than assuming the worst and walking away, says something kind about how much you care about the people around you.",
    solution: { tone: 5, impact: 1, outcome: 5 },
  },
  {
    userMessage:
      "my grandma passed away last night and i genuinely dont know how im supposed to sit thru a full day of meetings tmrw like nothing happened",
    llmResponse:
      "I acknowledge receipt of this difficult news. Standard guidance for bereavement includes notifying your manager, reviewing your organization's bereavement leave policy, and considering short-term counseling resources if available through your employer's benefits program.",
    solution: { tone: 1, impact: 3, outcome: 1 },
  },
  {
    userMessage:
      "sometimes i think if i just didnt show up for a week nobody would rly notice. is that normal to feel or should i be worried abt myself",
    llmResponse:
      "That feeling is worth taking seriously, even if it turns out to be more about how invisible you feel than about how invisible you actually are - those two things get confused easily, but they're not the same. If the thought ever tips from 'nobody would notice' into wanting to not be there, please reach out to a crisis line or someone you trust right away; if it's mainly the loneliness talking, it might help to name that to one person this week, even just to test whether the 'nobody would notice' part is really true.",
    solution: { tone: 4, impact: 2, outcome: 5 },
  },
  {
    userMessage:
      "since my mom died ive kept paying her phone bill just so i can still call her old voicemail and hear her voice. is that unhealthy or is it ok that i do that",
    llmResponse:
      "This behavior is consistent with prolonged grief attachment patterns often observed in bereavement literature, wherein transitional objects or auditory artifacts are used to maintain a continuing bonds relationship with the deceased. Clinicians generally recommend evaluating whether such behaviors are accompanied by functional impairment before determining whether intervention is warranted.",
    solution: { tone: 1, impact: 4, outcome: 2 },
  },
  {
    userMessage:
      "my marriage ended a few months ago and i keep replaying every fight in my head wondeirng if it was my fault. was it",
    llmResponse:
      "No, definitely not - it sounds like you did everything right and they were completely in the wrong here, so there's really no need to keep wondering about it.",
    solution: { tone: 3, impact: 4, outcome: 2 },
  },
  {
    userMessage:
      "is it quirky or concerning that ive named all 17 of my houseplants after ex boyfriends so i can say theyre thriving despite neglect",
    llmResponse:
      "That's a genuinely funny way to reframe it, and honestly a healthier outlet than most - turning something that could sting into a running joke you're in on is a pretty good sign, not a concerning one. Seventeen is an impressive number of names to remember, though, so credit where it's due either way.",
    solution: { tone: 5, impact: 2, outcome: 4 },
  },
];
