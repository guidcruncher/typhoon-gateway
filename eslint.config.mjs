import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 1. Global ignores
  {
    ignores: ['tests/**', 'dist/**', 'scripts/**', 'vitest.config.ts', 'pnpm-lock.yaml']
  },

  // 2. Base configs
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier, 

  // 3. Main Project Rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        // Ensure this points to your main tsconfig or tsconfig.eslint.json
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
      'prettier': prettierPlugin,
      'import': importPlugin,
    },
    settings: {
      'import/resolver': {
        'typescript': {
          'alwaysTryTypes': true,
          'project': './tsconfig.json'
        }
      }
    },
    rules: {
      // Prettier execution
      'prettier/prettier': 'error',

      // Typhon Gateway specific overrides
      '@typescript-eslint/no-explicit-any': 'off',
      'no-case-declarations': 'off',
      
      // Import Sorting (Fixed: the key in plugins matches this prefix)
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      
      // Path Alias and Import Validation
      'import/no-unresolved': 'error',
      
      // Unused Variables/Imports Logic
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { 
          vars: 'all', 
          varsIgnorePattern: '^_', 
          args: 'after-used', 
          argsIgnorePattern: '^_' 
        },
      ],
    },
  },

  // 4. Config File Override
  {
    files: ['eslint.config.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  }
);
