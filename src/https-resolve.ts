import { createDeno } from './deno.ts';
import type { ESModule, PluginConfig } from './types.ts';

const DENO_SPECIFIER = 'deno:';
const HTTP_IMPORT_REGEX = /from ("|')(https:\/\/.+)("|')/g;

function toHttpsSpecifier(specifier: string) {
  return specifier.replace(DENO_SPECIFIER, 'https://');
}

function toDenoSpecifier(specifier: string) {
  return specifier.replace('https://', DENO_SPECIFIER);
}

export default function httpsResolve(config: PluginConfig) {
  const deno = createDeno(config);

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
        HTTP_IMPORT_REGEX,
        (str) => {
          return toDenoSpecifier(str);
        },
      );

      return replaced;
    },

    async resolveId(importee: string, importer: string) {
      if (importee.indexOf(DENO_SPECIFIER) === 0) {
        // We have found a top level import for a Deno module.
        const specifier = toHttpsSpecifier(importee);

        await deno.cache(specifier);

        return importee;
      }

      if (importer.indexOf(DENO_SPECIFIER) === 0) {
        // We've found an import inside a deno module, let's find it!
        const specifier = toHttpsSpecifier(importer);
        const info = await deno.info(specifier);
        const module = info.modules.find((mod): mod is ESModule =>
          mod.specifier === specifier
        );
        const dependency = module?.dependencies?.find((dep) =>
          dep.specifier === importee
        );

        if (!dependency) {
          throw new Error(
            `invariant: module ${importee} in ${importer} not found during id resolution`,
          );
        }

        return toDenoSpecifier(dependency.code.specifier);
      }

      return null;
    },

    async load(id: string) {
      if (id.indexOf(DENO_SPECIFIER) === 0) {
        const specifier = toHttpsSpecifier(id);
        const module = await deno.module(specifier);
        if (!module) {
          throw new Error(`invariant: module ${id} not found during load`);
        }

        return await Deno.readTextFile(module.emit || module.local);
      }

      return null;
    },
  };
}
