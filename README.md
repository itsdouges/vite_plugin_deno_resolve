# vite_plugin_deno_resolve

This plugin enables Vite to resolve modules using [Deno](https://deno.land).
Currently only remote modules are resolved through Deno with local modules using
Vite's default behavior.

## Requirements

- Deno v1.29.1 or higher.
- Vite v3.2.4 or higher.

## Install

Import the plugin to your Vite config and pass it to the plugins array.

```js
import { defineConfig } from 'npm:vite@3.2.4';
import denoResolve from 'https://deno.land/x/vite_plugin_deno_resolve/mod.ts';

export default defineConfig({
  plugins: [denoResolve()],
});
```

## Local development

```sh
deno task https # Start https example
deno task npm   # Start npm example
```
