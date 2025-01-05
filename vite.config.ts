import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const renameIndexPlugin = (newFilename: string): import('vite').Plugin => {
  return {
    name: 'renameIndex',
    enforce: 'post',
    generateBundle(options, bundle) {
      const indexHtml = bundle['index.html']
      indexHtml.fileName = newFilename
      console.log('renaming index.html to', indexHtml.fileName)
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'index.html'
      }
    }
  }
});
