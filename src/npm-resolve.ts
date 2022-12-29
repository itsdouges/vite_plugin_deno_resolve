import { createDeno } from './deno.ts';
import { PluginConfig } from './types.ts';

function createPlugin(plugin: import('npm:vite').Plugin) {
  return plugin;
}

export default function npmResolve(config: PluginConfig) {
  // TODO(bartlomieju): both plugins should use the same instance, or maybe
  // both plugins should be combined.
  const deno = createDeno(config);

  return createPlugin({
    name: 'vite:deno-npm-resolve',

    enforce: 'pre' as const,

    configResolved(config) {
      const previousCreateResolver = config.createResolver;
      const createResolver: typeof config['createResolver'] = (options) => {
        return previousCreateResolver(options);
      };

      config.createResolver = createResolver;
    },

    async resolveId(id: string, importer: string | undefined) {
      // console.log('resolveId npm', id, importer);

      if (id.startsWith('npm:')) {
        await deno.cache(id);
        return id;
      } else {
        const r = await this.resolve(id, importer, { skipSelf: true });
        console.log(`resolve result id: ${id} importer: ${importer} r:`, r);
        return r;
      }
    },

    async load(id: string) {
      console.log('load npm', id);

      if (!id.startsWith('npm:')) {
        return null;
      }

      const ref = npmPackageReference(id);

      // TODO(bartlomieju): this shouldn't be called on each load, it can
      // be cached per run
      const cacheInfo = await deno.cacheInfo();
      const npmCache = cacheInfo.npmCache;

      const specifier = ref.name;
      const version = ref.versionReq;

      if (!version) {
        throw new Error(`Version not specified for ${specifier}`);
      }

      console.log('NpmPackageReference', ref);
      const moduleDirPath =
        `${npmCache}/registry.npmjs.org/${specifier}/${version}`;

      const packageJson = JSON.parse(
        await Deno.readTextFile(
          `${moduleDirPath}/package.json`,
        ),
      );

      let file = packageJson.main || 'index.js';
      if (ref.subPath) {
        // TODO(bartlomieju): handle other extensions
        file = `${ref.subPath}.js`;
      }
      return await Deno.readTextFile(`${moduleDirPath}/${file}`);
    },
  });
}

interface NpmPackageReference {
  name: string;
  versionReq: string | null;
  subPath: string | null;
}

function npmPackageReference(specifier: string): NpmPackageReference {
  if (!specifier.startsWith('npm:')) {
    throw new Error(`Invalid npm package reference: ${specifier}`);
  }

  specifier = specifier.substring(4);
  const parts = specifier.split('/');
  let namePartLen;
  if (specifier.startsWith('@')) {
    namePartLen = 2;
  } else {
    namePartLen = 1;
  }
  if (parts.length < namePartLen) {
    throw new Error(`Invalid npm package reference: ${specifier}`);
  }
  const nameParts = parts.slice(0, namePartLen);
  let lastNamePart = nameParts[nameParts.length - 1];
  const atIndex = lastNamePart.lastIndexOf('@');
  let version;
  let name;

  if (atIndex !== -1) {
    version = lastNamePart.substring(atIndex + 1);
    lastNamePart = lastNamePart.substring(0, atIndex);

    if (namePartLen === 1) {
      name = lastNamePart;
    } else {
      name = `${nameParts[0]}/${lastNamePart}`;
    }
  } else {
    name = nameParts.join('/');
  }

  let subPath = null;
  if (parts.length !== namePartLen) {
    subPath = parts.slice(namePartLen).join('/');
  }

  // TODO(bartlomieju): handle version specified after subpath

  if (!name) {
    throw new Error(
      `Invalid npm package reference: ${specifier}. Did not contain a package name`,
    );
  }

  return {
    name,
    versionReq: version || null,
    subPath,
  };
}
