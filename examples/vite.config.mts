import reactImport from "npm:@vitejs/plugin-react@2.2.0";
import { defineConfig } from "npm:vite@3.2.4";
import denoResolve from "../mod.ts";

const react = reactImport as never as typeof reactImport.default;

export default defineConfig({
  plugins: [react(), denoResolve()],
});
