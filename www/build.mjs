import * as esbuild from 'esbuild'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

await esbuild.build({
  entryPoints: [resolve(__dirname, 'js/app.jsx')],
  outfile: resolve(__dirname, 'js/app.bundle.js'),
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  format: 'iife',
  target: ['es2015'],
  minify: false,
  sourcemap: false,
}).catch(() => process.exit(1))
