export default function npmResolve() {
  return {
    name: 'vite:deno-npm-resolve',

    enforce: 'pre',

    resolveId() {
      return null;
    },
  };
}
