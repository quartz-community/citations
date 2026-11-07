import rehypeCitation from "rehype-citation";
import type { PluggableList } from "unified";
import { visit } from "unist-util-visit";
import type { QuartzTransformerPlugin, BuildCtx } from "@quartz-community/types";

export interface CitationsOptions {
  bibliographyFile: string;
  suppressBibliography: boolean;
  linkCitations: boolean;
  csl: string;
}

// Numeric styles (e.g. IEEE) render each bibliography entry as a label
// (`.csl-left-margin`) and the reference text (`.csl-right-inline`), both block
// elements. Lay them out side by side (jackyzha0/quartz#2471). Scoped with
// `:has()` so author-date styles, which have no label, are left untouched.
export const citationsCSS = `
.csl-entry:has(> .csl-left-margin) {
  display: flex;
  gap: 0.5em;
  align-items: baseline;
}
.csl-entry > .csl-left-margin {
  flex: 0 0 auto;
  min-width: 2.5em;
}
.csl-entry > .csl-right-inline {
  flex: 1 1 auto;
  min-width: 0;
}
`;

const defaultOptions: CitationsOptions = {
  bibliographyFile: "./bibliography.bib",
  suppressBibliography: false,
  linkCitations: false,
  csl: "apa",
};

export const Citations: QuartzTransformerPlugin<Partial<CitationsOptions>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  return {
    name: "Citations",
    htmlPlugins(ctx: BuildCtx) {
      const plugins: PluggableList = [];
      let lang: string = "en-US";
      if (ctx.cfg.configuration.locale !== "en-US") {
        lang = `https://raw.githubusercontent.com/citation-style-language/locales/refs/heads/master/locales-${ctx.cfg.configuration.locale}.xml`;
      }
      plugins.push([
        rehypeCitation,
        {
          bibliography: opts.bibliographyFile,
          suppressBibliography: opts.suppressBibliography,
          linkCitations: opts.linkCitations,
          csl: opts.csl,
          lang,
        },
      ]);

      plugins.push(() => {
        return (tree, _file) => {
          visit(tree, "element", (node, _index, _parent) => {
            if (node.tagName === "a" && node.properties?.href?.startsWith("#bib")) {
              node.properties["data-no-popover"] = true;
            }
          });
        };
      });

      return plugins;
    },
    externalResources() {
      return {
        css: [{ content: citationsCSS, inline: true }],
      };
    },
  };
};
