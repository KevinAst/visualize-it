import svelte     from 'rollup-plugin-svelte';
import resolve    from '@rollup/plugin-node-resolve';
import commonjs   from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import {terser}   from 'rollup-plugin-terser';
import postcss    from 'rollup-plugin-postcss'; // KJB: in support of: Sass Processor (used by Svelte Material UI (SMUI))
import path       from 'path';                  // KJB: in support of: Sass Processor (used by Svelte Material UI (SMUI))
import alias      from '@rollup/plugin-alias';  // KJB: in support of: Absolute Imports

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file - better for performance
			css: css => {
				css.write('public/build/bundle.css');
			}
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),

    // KJB: Absolute Imports
    alias({
      entries: [
        { find: 'visualize-it', replacement: 'src' },
      ]
    }),

    // KJB: Sass Processor (used by Svelte Material UI (SMUI))
    postcss({
      extensions: ['.scss', '.sass'],
      extract:    false,
      minimize:   true,
      use: [
        ['sass', {
          includePaths: [
            './src/theme',
            './node_modules',
            // This is only needed because we're using a local module. :-/
            // Normally, you would not need this line.
            path.resolve(__dirname, '..', 'node_modules')
          ]
        }]
      ]
    }),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};

function serve() {
	let started = false;

	return {
		writeBundle() {
			if (!started) {
				started = true;

				require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}
