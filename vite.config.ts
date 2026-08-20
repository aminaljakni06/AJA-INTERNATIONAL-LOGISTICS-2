import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const vendorChunkGroups: Array<[string, string[]]> = [
  ['react-vendor', ['react', 'react-dom', 'scheduler']],
  ['firebase-vendor', ['firebase', '@firebase']],
  ['charts-vendor', ['recharts', 'd3-array', 'd3-color', 'd3-ease', 'd3-format', 'd3-interpolate', 'd3-path', 'd3-scale', 'd3-shape', 'd3-time', 'd3-time-format']],
  ['three-vendor', ['three', '@react-three', '@dimforge', 'detect-gpu', 'meshline', 'stats-gl', 'three-stdlib', 'troika-three-text', 'troika-three-utils', 'troika-worker-utils']],
  ['pdf-vendor', ['jspdf']],
  ['canvas-vendor', ['html2canvas', 'canvg', 'dompurify']],
  ['excel-vendor', ['exceljs', 'jszip', 'fflate']],
  ['maps-vendor', ['leaflet']],
  ['motion-vendor', ['motion', 'framer-motion']],
  ['icons-vendor', ['lucide-react']],
  ['ai-vendor', ['@google/genai']],
];

function getManualChunk(id: string): string | undefined {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  const normalizedId = id.replace(/\\/g, '/');

  for (const [chunkName, packages] of vendorChunkGroups) {
    if (packages.some(packageName => normalizedId.includes(`/node_modules/${packageName}/`))) {
      return chunkName;
    }
  }

  return undefined;
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks: getManualChunk,
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
