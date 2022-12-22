import httpsResolve from './src/https-resolve.ts';
import npmResolve from './src/npm-resolve.ts';

export default function denoResolve() {
  return [httpsResolve(), npmResolve()];
}
