import { defineConfig } from 'npm:vite@3.2.4';
import denoResolve from './mod.ts';
import react from "npm:@vitejs/plugin-react";

import "npm:react";
import "npm:react-dom";

export default defineConfig({
  plugins: [react(), denoResolve()],
});
