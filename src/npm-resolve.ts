import { PluginConfig } from './types.ts';

export default function npmResolve(_: PluginConfig) {
  return {
    name: 'vite:deno-npm-resolve',

    enforce: 'pre',

    resolveId() {
      return null;
    },
  };
}
