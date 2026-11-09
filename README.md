# @quartz-community/citations

Adds academic citation support using a BibTeX bibliography file and configurable citation styles.

## Installation

```bash
npx quartz plugin add @quartz-community/citations
```

It is already in the default `quartz.config.yaml` (disabled, `order: 85`); set `enabled: true` to turn it on.

## Usage

```yaml title="quartz.config.yaml"
plugins:
  - source: "@quartz-community/citations"
    enabled: true
    order: 85
    options:
      bibliographyFile: "./bibliography.bib"
      csl: apa
```

For advanced use cases, you can override in TypeScript:

```ts title="quartz.ts (override)"
import * as ExternalPlugin from "./.quartz/plugins";

ExternalPlugin.Citations({
  bibliographyFile: "./bibliography.bib",
  csl: "apa",
});
```

## Configuration

| Option                 | Type      | Default                | Description                                                                                                            |
| ---------------------- | --------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `bibliographyFile`     | `string`  | `"./bibliography.bib"` | The path to the BibTeX bibliography file, relative to the root of your Quartz repository.                              |
| `suppressBibliography` | `boolean` | `false`                | Whether to suppress the bibliography at the end of the page.                                                           |
| `linkCitations`        | `boolean` | `false`                | Whether to link citations to the bibliography.                                                                         |
| `csl`                  | `string`  | `"apa"`                | The CSL style to use for citations. See [rehype-citation](https://rehype-citation.netlify.app/custom-csl) for options. |

## Documentation

See the [Quartz documentation](https://quartz.jzhao.xyz/plugins/Citations) for more information.

## License

MIT
