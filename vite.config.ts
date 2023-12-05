import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: resolve(__dirname, 'src/main.ts'),
			name: 'MyLib',
			// the proper extensions will be added
			fileName: 'index',
		},
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled
			// into your library
			external: ['three'],
			output: {
				// Provide global variables to use in the UMD build
				// for externalized deps
				globals: {
					// vue: 'Vue',
				},
			},
		},
	  },
})
