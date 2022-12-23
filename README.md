# vite_plugin_deno_resolve

A Vite plugin which locates modules using Deno.

## Requirements

- Deno v1.29.1 or higher.
- Vite v3.2.4 or higher.

## Install

Import the plugin to your Vite config.

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
