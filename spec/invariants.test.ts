import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "bun:test";

// The invariants run against the BUILT site, so they check what actually
// ships, not the source. Run `bun run build` in interactive-explainer/ first
// (the CI `check` job does). These hold for any good website, whatever the
// week's brief asks — the week-specific contracts live in your own
// spec/*.test.ts alongside this file.
const DIST = resolve("interactive-explainer/dist");

function htmlFiles(dir: string = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

type PageSummary = {
  lang: string | null;
  title: string;
  hasViewportMeta: boolean;
  hasNav: boolean;
  h1Count: number;
  images: { src: string | null; hasAlt: boolean }[];
};

// HTMLRewriter ships inside `bun` itself, so these invariants need no
// HTML-parsing dependency of their own --- no node_modules, no package.json,
// at the repo root. It's a streaming API, so draining the transformed body is
// what actually runs the element handlers below.
async function summarize(html: string): Promise<PageSummary> {
  const summary: PageSummary = {
    lang: null,
    title: "",
    hasViewportMeta: false,
    hasNav: false,
    h1Count: 0,
    images: [],
  };

  const rewriter = new HTMLRewriter()
    .on("html", {
      element(el) {
        summary.lang = el.getAttribute("lang");
      },
    })
    .on("title", {
      text(chunk) {
        summary.title += chunk.text;
      },
    })
    .on('meta[name="viewport"]', {
      element() {
        summary.hasViewportMeta = true;
      },
    })
    .on("nav", {
      element() {
        summary.hasNav = true;
      },
    })
    .on("h1", {
      element() {
        summary.h1Count += 1;
      },
    })
    .on("img", {
      element(el) {
        summary.images.push({ src: el.getAttribute("src"), hasAlt: el.hasAttribute("alt") });
      },
    });

  await rewriter.transform(new Response(html)).text();
  return summary;
}

const pages = await Promise.all(
  htmlFiles().map(async (path) => ({
    name: relative(DIST, path),
    page: await summarize(readFileSync(path, "utf8")),
  })),
);

describe("invariants: every page", () => {
  it("built at least one page", () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  for (const { name, page } of pages) {
    describe(name, () => {
      it("declares its language", () => {
        expect(page.lang).toBeTruthy();
      });

      it("has a real title", () => {
        expect(page.title.trim()).not.toBe("");
      });

      it("has a mobile viewport", () => {
        expect(page.hasViewportMeta).toBe(true);
      });

      it("has a navigation landmark", () => {
        expect(page.hasNav).toBe(true);
      });

      it("has exactly one top-level heading", () => {
        expect(page.h1Count).toBe(1);
      });

      it("gives every image alt text", () => {
        for (const img of page.images) {
          expect(img.hasAlt, `<img src="${img.src}"> needs alt text`).toBe(true);
        }
      });
    });
  }
});

describe("invariants: home page", () => {
  const home = pages.find(({ name }) => name === "index.html");

  it("exists", () => {
    expect(home).toBeTruthy();
  });
});
