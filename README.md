# vite_plugin_deno_resolve

This plugin enables [Vite](https://vitejs.dev) to resolve modules using
[Deno](https://deno.land), the easiest, most secure JavaScript runtime.

See:
[Deno feature highlights](https://deno.land/manual@v1.29.1/introduction#feature-highlights).

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

> Using VSCode? Make sure to install the
> [Deno extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)
> and set `deno.enable` in your VSCode workspace settings.

You're all set! Now when running Vite all dependencies will be resolved by Deno
and if missing, cached locally.

## Local development

```sh
deno task https # Start https example
deno task npm   # Start npm example
```
