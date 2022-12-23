import { denoCache, denoInfo } from './deno.ts';
import type { ESModule } from './types.ts';

export default function httpsResolve() {
  return {
    name: 'vite:deno-https-resolve',

    enforce: 'pre',

    transform(code: string) {
      if (code.indexOf('from \'https://') === -1) {
        return;
      }

      // We want to prepend any https imports with "deno:" so it can be picked
      // up by resolvedId(), else it skips it entirely and is loaded as native esm.
      const replaced = code.replaceAll(
        'from \'https://',
        'from \'deno:https://',
      );

      return replaced;
    },

    async resolveId(importee: string, importer: string) {
      if (importee.indexOf('deno:') === 0) {
        // We have found a top level import for a Deno module.
        const specifier = importee.replace('deno:', '');

        await denoCache(specifier);

        return specifier;
      }

      if (importer.indexOf('https://') === 0) {
        // We've found an import inside a deno module, let's find it!
        const info = await denoInfo(importer);
        const module = info.modules.find((mod): mod is ESModule =>
          mod.specifier === importer
        );
        const dependency = module?.dependencies.find((dep) =>
          dep.specifier === importee
        );

        if (!dependency || !dependency.code) {
          throw new Error('invaraint');
        }

        return dependency.code.specifier;
      }

      return null;
    },

    async load(id: string) {
      if (id.indexOf('https://') === 0) {
        const info = await denoInfo(id);
        const module = info.modules.find((mod): mod is ESModule =>
          mod.specifier === id
        );

        if (module) {
          return await Deno.readTextFile(module.emit);
        }
      }

      return null;
    },
  };
}
