import { defineConfig } from 'npm:vite@3.2.4';
import denoResolve from './mod.ts';

export default defineConfig({
  plugins: [denoResolve()],
});
