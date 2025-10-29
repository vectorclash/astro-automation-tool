// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  outDir: './banners',
  build: {
    format: 'directory',
    inlineStylesheets: 'always'
  },
  compressHTML: false
});
