# @quartz-community/citations

Adds academic citation support using a BibTeX bibliography file and configurable citation styles.

## Installation

```bash
npx quartz plugin add github:quartz-community/citations
```

## Usage

```ts
// quartz.config.ts
import * as ExternalPlugin from "./.quartz/plugins"

const config: QuartzConfig = {
  plugins: {
    transformers: [
      ExternalPlugin.Citations(),
    ],
  },
}
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| bibliographyFile | `string` | `"./bibliography.bib"` | The path to the BibTeX bibliography file. |
| suppressBibliography | `boolean` | `false` | Whether to suppress the bibliography at the end of the page. |
| linkCitations | `boolean` | `false` | Whether to link citations to the bibliography. |
| csl | `string` | `"apa"` | The CSL style to use for citations. |

## Documentation

See the [Quartz documentation](https://quartz.jzhao.xyz/) for more information.

## License

MIT
