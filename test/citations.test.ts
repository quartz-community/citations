import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { unified } from "unified";
import { VFile } from "vfile";
import type { Root, RootContent } from "hast";
import type { BuildCtx } from "@quartz-community/types";
import { Citations, citationsCSS } from "../src/transformer";
import type { CitationsOptions } from "../src/transformer";

const BIB = `@article{doe2020,
  author = {Doe, Jane},
  title = {On Gardens},
  journal = {Journal of Notes},
  year = {2020},
}
`;

/** compact HTML-ish serialization, enough to assert on (no hast-util-to-html here) */
function html(node: Root | RootContent): string {
  if (node.type === "text") return node.value;
  const children = "children" in node ? node.children.map(html).join("") : "";
  if (node.type !== "element") return children;
  const attrs = Object.entries(node.properties ?? {})
    .map(
      ([k, v]) =>
        ` ${k === "className" ? "class" : k}="${Array.isArray(v) ? v.join(" ") : String(v)}"`,
    )
    .join("");
  return `<${node.tagName}${attrs}>${children}</${node.tagName}>`;
}

const ctx = (locale = "en-US") => ({ cfg: { configuration: { locale } } }) as unknown as BuildCtx;

let root: string;
beforeAll(async () => {
  // the Quartz checkout: bibliographyFile is relative to it
  root = await fs.mkdtemp(path.join(os.tmpdir(), "citations-"));
  await fs.writeFile(path.join(root, "bibliography.bib"), BIB);
  await fs.mkdir(path.join(root, "refs"));
  await fs.writeFile(path.join(root, "refs", "other.bib"), BIB.replace("doe2020", "other1"));
});
afterAll(() => fs.rm(root, { recursive: true, force: true }));

async function cite(text: string, opts?: Partial<CitationsOptions>) {
  const plugins = Citations(opts).htmlPlugins!(ctx());
  const tree: Root = {
    type: "root",
    children: [
      { type: "element", tagName: "p", properties: {}, children: [{ type: "text", value: text }] },
    ],
  };
  const out = await unified()
    .use(plugins as never)
    .run(tree as never, new VFile({ cwd: root }));
  return html(out as Root);
}

describe("Citations", () => {
  it("renders an APA citation and the bibliography from ./bibliography.bib by default", async () => {
    const out = await cite("As shown [@doe2020].");
    expect(out).toContain("(Doe, 2020)");
    expect(out).toContain('<div id="refs" class="references csl-bib-body">');
    expect(out).toContain("Doe, J. (2020). On Gardens.");
    expect(out).not.toContain('href="#bib-doe2020"');
  });

  it("honours bibliographyFile", async () => {
    expect(await cite("See [@other1].", { bibliographyFile: "refs/other.bib" })).toContain(
      "(Doe, 2020)",
    );
  });

  it("links citations to the bibliography with linkCitations, without popovers", async () => {
    const out = await cite("As shown [@doe2020].", { linkCitations: true });
    expect(out).toContain('<a href="#bib-doe2020" data-no-popover="true">Doe, 2020</a>');
    expect(out).toContain('id="bib-doe2020"');
  });

  it("honours suppressBibliography and csl", async () => {
    const out = await cite("As shown [@doe2020].", {
      csl: "vancouver",
      suppressBibliography: true,
    });
    expect(out).toContain("(1)");
    expect(out).not.toContain("references");
  });

  it("passes the site locale to rehype-citation (bundled en-US, CSL locale file otherwise)", () => {
    const options = (locale: string) =>
      ((Citations().htmlPlugins!(ctx(locale)) as unknown[])[0] as [unknown, { lang: string }])[1]
        .lang;
    expect(options("en-US")).toBe("en-US");
    expect(options("de-DE")).toBe(
      "https://raw.githubusercontent.com/citation-style-language/locales/refs/heads/master/locales-de-DE.xml",
    );
  });

  it("adds the CSS that lays numeric bibliography labels out beside their entries", () => {
    expect(Citations().externalResources!(ctx())).toEqual({
      css: [{ content: citationsCSS, inline: true }],
    });
    expect(citationsCSS).toContain(".csl-entry:has(> .csl-left-margin)");
  });
});
