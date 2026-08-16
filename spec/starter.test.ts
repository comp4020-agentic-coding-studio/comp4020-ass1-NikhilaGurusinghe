import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "bun:test";

// A worked page-specific test, not an invariant. It describes the starter
// implementation so there is a concrete example to replace with tests for the
// week's published spec.

// Both failures below mean the same thing: the starter page is gone, so this
// test has done its job. The reader may never open this file, so the advice
// has to live in the failure output.
const NEXT_STEP =
  "Replace it with a test for this week's published spec, or delete it — see spec/README.md.";

describe("starter page", () => {
  it("marks the intro region used by the starter script", async () => {
    const distPath = resolve("frienddotcom/dist/index.html");
    expect(
      existsSync(distPath),
      `${distPath} not found — you've restructured away from it. ${NEXT_STEP}`,
    ).toBe(true);

    let foundIntro = false;
    const rewriter = new HTMLRewriter().on('[data-testid="intro"]', {
      element() {
        foundIntro = true;
      },
    });
    await rewriter.transform(new Response(readFileSync(distPath, "utf8"))).text();

    expect(
      foundIntro,
      `This described the starter page. ${NEXT_STEP} Don't re-add the attribute to make it pass.`,
    ).toBe(true);
  });
});
