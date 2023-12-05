/// <reference types="vitest" />

import { defineConfig } from 'vite';

export default defineConfig( {
    test: {
        include: [ '**/*.{test,spec}.browser.?(c|m)[jt]s?(x)' ],
        browser: {
            enabled: true,
            headless: true,
            name: 'chrome',
        },
    },
} );
