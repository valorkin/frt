import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import federation from '@module-federation/rollup-federation';
import copy from 'rollup-plugin-copy'

import pkg from './package.json' assert {type: 'json'};


export default {
  input: 'src/index.js',
  preserveEntrySignatures: false,
  external: ['react', 'react-dom'],
  plugins: [
    injectProcessEnv({
      NODE_ENV: 'production',
    }),
    copy({
      targets: [
        {src: ['../node_modules/react/umd/react.development.js',
            '../node_modules/react/umd/react.production.min.js',
            '../node_modules/react-dom/umd/react-dom.development.js',
            '../node_modules/react-dom/umd/react-dom.production.min.js',],
          dest: 'vendor'
        }
      ]
    }),
    resolve({
      browser: true,
      transformMixedEsModules: true,
      modulesOnly: true,
      dedupe: ['react', 'react-dom'],
      modulePaths: ['../node_modules'],
      extensions: ['.mjs', '.js', '.jsx', '.json'],
      preferBuiltins: false,
    }),
    commonjs({
      transformMixedEsModules: true,
      include: ['node_modules/*', '../node_modules/*'],
    }),
    babel(),
    serve({
      port: 8082,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      }
    }),
    federation({
      remotes: {
        foo_app1: 'webpackremote',
        foo_rollup_spa: 'rollup_spa',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: pkg.dependencies.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: pkg.dependencies['react-dom'],
        },
      },
    }),
  ],
  output: [{format: 'system', dir: pkg.main}],
};
