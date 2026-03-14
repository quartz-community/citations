import rehypeCitation from 'rehype-citation';
import { visit } from 'unist-util-visit';

// src/transformer.ts
var defaultOptions = {
  bibliographyFile: "./bibliography.bib",
  suppressBibliography: false,
  linkCitations: false,
  csl: "apa"
};
var Citations = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  return {
    name: "Citations",
    htmlPlugins(ctx) {
      const plugins = [];
      let lang = "en-US";
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
          lang
        }
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
    }
  };
};

export { Citations };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map