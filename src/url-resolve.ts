import { join, toFileUrl } from 'https://deno.land/std@0.170.0/path/mod.ts';
import { createDeno } from './deno.ts';
import type { ESModule, PluginConfig } from './types.ts';

const URL_NAMESPACE = '@url/';
const HTTP_IMPORT_REGEX = /from ("|')(https?:\/\/.+)("|')/g;

function toURLSpecifier(specifier: string) {
  return new URL(specifier.replace(URL_NAMESPACE, '')).href;
}

function toURLNamespace(specifier: string) {
  return URL_NAMESPACE + specifier;
}

export default function httpsResolve(config: PluginConfig) {
  const deno = createDeno(config);

  return {
    name: 'vite:deno-https-resolve',

    enforce: 'pre' as const,

    transform(code: string) {
      if (code.indexOf('from \'http') === -1) {
        return;
      }

      // We want to prepend any https imports with "deno:" so it can be picked
      // up by resolvedId(), else it skips it entirely and is loaded as native esm.
      const replaced = code.replaceAll(
        HTTP_IMPORT_REGEX,
        (str) => {
          return str.replace('from \'', 'from \'' + URL_NAMESPACE);
        },
      );

      return replaced;
    },

    async resolveId(importee: string, importer: string | undefined) {
      // console.log(importee);

      // if (importee[0].startsWith('/')) {
      //   // Absolute import
      //   console.log(toFileUrl(importee));
      // } else if (importee[0].startsWith('.')) {
      //   // Relative import
      //   console.log(importer);
      //   console.log(toFileUrl(join(importer || appRoot, importee)));
      // }

      if (importee.indexOf(URL_NAMESPACE) === 0) {
        // We have found a top level import for a Deno module.
        const specifier = toURLSpecifier(importee);

        await deno.cache(specifier);

        return toURLNamespace(specifier);
      }

      if (importer && importer.indexOf(URL_NAMESPACE) === 0) {
        // We've found an import inside a deno module, let's find it!
        const specifier = toURLSpecifier(importer);
        const info = await deno.info(specifier);
        const module = info.modules.find((mod): mod is ESModule =>
          mod.specifier === specifier
        );
        const dependency = module?.dependencies?.find((dep) =>
          dep.specifier === importee
        );

        if (!dependency) {
          throw new Error(
            `invariant: module ${importee} in ${importer} was not found during id resolution`,
          );
        }

        return toURLNamespace(dependency.code.specifier);
      }

      return null;
    },

    async load(id: string) {
      if (id.indexOf(URL_NAMESPACE) === 0) {
        const specifier = toURLSpecifier(id);
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
