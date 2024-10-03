import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import tsconfigPaths from "vite-tsconfig-paths";
import { ManifestV3Export, crx } from "@crxjs/vite-plugin";

import manifestJson from "./public/manifest.json";

const manifest = manifestJson as ManifestV3Export;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react(), crx({ manifest })],
});
