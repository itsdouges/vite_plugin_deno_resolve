import { dirname, toFileUrl } from 'https://deno.land/std@0.170.0/path/mod.ts';
import { createDeno } from './deno.ts';
import type { PluginConfig } from './types.ts';

const URL_NAMESPACE = '@url/';
const FILE_IMPORT = /^(\.?\/)/;
const HTTP_IMPORT_REGEX = /from ("|')(https?:\/\/.+)("|')/g;
const HANDLED_SPECIFIERS = /^(https?|file|\.\/|\/)/;
const HANDLED_EXT = /\.(m?(t|j)sx?)$/;
const HAS_EXT = /\.[A-z]{2,}$/;

function toURLNamespace(specifier: URL) {
  return URL_NAMESPACE + specifier;
}

function toURL(specifier?: string, file?: string): URL | undefined {
  const fileURL = file ? toURL(dirname(file)) : undefined;

  if (!specifier) {
    return undefined;
  }

  const parsedSpecifier = specifier.replace(URL_NAMESPACE, '');

  if (!HANDLED_SPECIFIERS.exec(parsedSpecifier)) {
    return undefined;
  }

  if (FILE_IMPORT.exec(parsedSpecifier)) {
    return fileURL
      ? new URL(fileURL + parsedSpecifier.replace('./', '/'))
      : toFileUrl(parsedSpecifier);
  }

  try {
    return new URL(parsedSpecifier);
  } catch (_) {
    return undefined;
  }
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
      const importURL = toURL(importee, importer);
      if (
        !importURL ||
        (HAS_EXT.exec(importURL.href) && !HANDLED_EXT.exec(importURL.href))
      ) {
        // Importee not handled by us return early and let someone else handle it.
        return null;
      }

      await deno.cache(importURL);

      return toURLNamespace(importURL);
    },

    async load(id: string) {
      const url = toURL(id);
      if (url) {
        const module = await deno.module(url);
        if (!module) {
          throw new Error(`invariant: ${url} not found`);
        }

        return await Deno.readTextFile(module.emit || module.local);
      }

      return null;
    },
  };
}
