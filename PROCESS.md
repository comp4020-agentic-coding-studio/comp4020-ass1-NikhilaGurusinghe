# Process overview

## What I built

TODO

## The moments that mattered

1. **Randomized minigame order broke the type checker, and the obvious fix
   would have broken the loading guard.** `MINIGAMES` was typed as
   `Array<() => React.JSX.Element>`, but `Captcha` legitimately returns `null`
   while its grid state initializes (`if (!gridAnswers) return null;`), so
   TypeScript flagged the array as soon as it was shuffled into a random
   order instead of a fixed one. The obvious fix — forcing every minigame to
   always return a real element — would have meant reworking that loading
   guard just to satisfy the type. Instead I widened the array's type to
   `React.ComponentType[]`, which is honest about what a React component can
   return and needed no changes to any minigame's logic. I checked it with
   `tsc --noEmit` (clean), a full `next build` (compiled and typechecked), and
   then loaded the page a few times in the browser to confirm the randomized
   order still rendered correctly with the loading guard intact.
   [`027de67`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-NikhilaGurusinghe/commit/027de679e11658a409dda82c8fd81711b33a4908)

2. **The bounding-box accuracy check only worked by coincidence.** Both the
   authored solution boxes and the user's drawn boxes are stored as
   percentages of the *container*, but the image inside that container was
   rendered with `object-contain` inside a fixed `aspect-square` box — so a
   non-square image gets letterboxed, and container-percent stops lining up
   with image-percent. It only "worked" because the one asset in use,
   `cat.jpg`, happens to be near-square (720×719). I asked myself whether this
   was already handled:
   > with the bounding box accuracy calculation what happens if the image
   > size of the image on the page is different to its original size then
   > its not possible to correlate the solution bounding box coords to the
   > ones drawn by the user, is this something you've already handled?

   My first fix was a conversion layer — helper functions to translate
   click/drag coordinates between container-percent and image-percent space —
   but that added a parallel set of math to every pointer handler for a
   problem that had a smaller root cause. I threw that attempt away and asked
   for the simpler option instead:
   > can i get rid of this by removing aspect-square?

   The actual fix: make the container's CSS `aspect-ratio` track the image's
   own `naturalWidth`/`naturalHeight` (captured via `onLoad`), so the
   container always matches the image's shape exactly and `object-contain`
   never has to letterbox it. No conversion math needed, at the cost of the
   container's on-screen shape now varying per asset. I verified it by
   watching the container snap to the image's real proportions on load at
   both viewport widths, and confirming `cat.jpg` was unaffected.
   [`12e9cba`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-NikhilaGurusinghe/commit/12e9cbaa4e311cb5b2edbafb43b40b535dce9b38)

3. **Highlight colour had spread past buttons, and re-prompting per-component
   wasn't going to fix that.** Each minigame had picked up its own one-off
   styling in isolation — captcha's timer was `text-white` sitting directly on
   the page's light grey background (invisible), tone-rating's "selected"
   rating state filled the whole circle with the highlight colour instead of
   looking like a radio button, and the highlight colour itself had leaked
   onto non-interactive elements (bounding-box outlines, a chat bubble) rather
   than staying a "this is clickable" signal. Rather than fix each component
   as a one-off, I set an explicit rule and applied it everywhere in one pass:
   > can you look at the style in tone-rating.tsx and unify that across all
   > the minigame components please? keep it as boring and plain as possible
   > only use highlight colour on buttons

   I checked the result by going component-by-component and confirming no
   non-button element still used the highlight colour, then compared the
   three minigames side by side to make sure the timer, container, and Next
   button now shared one convention instead of three.
   [`fb604eb...a40ff0e`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-NikhilaGurusinghe/compare/fb604ebaa184e1cbfd9ca2db14b72d9837aa4acb...a40ff0e7768fa8c64e888fcd3a74fc96b3bb295e)

4. **The family-screen toggle buttons only lined up by luck of the label
   width.** Food/heat/medicine each rendered as their own `flex
   justify-between` row, so the toggle button's horizontal position depended
   on how long that row's own label happened to be — it wasn't a real column,
   just three rows that happened to look similar. I was asked directly to fix
   the alignment structurally:
   > can you adjust the selection buttons for food, heat, and medicine so
   > they sit in their own column to the right of the costs? also increase
   > the gap between line items so that they match the size of the buttons
   > please

   Instead of nudging widths per-row, I turned the summary list into a single
   3-column CSS grid (label / cost / button) and had each row component
   render its cells as grid siblings rather than owning its own flex row, so
   the button column is a structural property of the grid, not a coincidence
   of matching widths — and rows without a button (savings, salary, rent)
   just leave that column empty. I checked that those non-toggle rows still
   lined up correctly against the toggle rows, and that the new row gap
   visually matched the buttons' `2rem` size rather than an arbitrary value.
   [`ac770b9`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-NikhilaGurusinghe/commit/ac770b9916b71e338516a7fc921c92184f317285)
