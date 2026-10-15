// Mirrors trailheadapps/lwc-recipes-oss, plus a block for the Node-side files.
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest';
import salesforceLwcConfig from '@salesforce/eslint-config-lwc/recommended.js';
import globals from 'globals';

export default defineConfig([
    {
        ignores: ['site/', '__lwr_cache__/', 'coverage/']
    },
    // Components and the shared content module
    {
        files: ['src/modules/**/*.js'],
        extends: [salesforceLwcConfig]
    },
    // Jest tests and mocks
    {
        files: ['**/__tests__/**/*.js', 'jest-mocks/**/*.js'],
        plugins: { jest: jestPlugin },
        languageOptions: {
            globals: { ...globals.jest, ...globals.node }
        },
        rules: {
            ...jestPlugin.configs.recommended.rules
        }
    },
    // Build script and tool configs, run by Node
    {
        files: ['scripts/**/*.js', '*.js'],
        extends: [js.configs.recommended],
        languageOptions: {
            globals: globals.node
        }
    }
]);
