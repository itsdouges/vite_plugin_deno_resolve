import { denoCache, denoInfo } from './deno.ts';

async function ensureCached(name: string) {
  await denoCache(name);
}

async function loadFromDenoCache(name: string) {
}

export default function httpsResolve() {
  return {
    name: 'vite:deno-https-resolve',

    enforce: 'pre',

    async resolveId(source: string) {
      if (source.startsWith('deno:')) {
        const path = source.replace('deno:', '');

        await ensureCached(path);

        return path;
      }

      return null;
    },

    async load(id: string) {
      if (id.startsWith('https')) {
        const info = await denoInfo(id);
        console.log(info);
      }

      return null;
    },

    transform(code: string) {
      return code.replace('from \'https://', 'from \'deno:https://');
    },
  };
}
