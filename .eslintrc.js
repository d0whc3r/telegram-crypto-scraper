module.exports = {
  root: true,
  settings: {
    'import/parsers': {
      '@babel/eslint-parser': ['.js', '.jsx'],
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    // 'import/resolver': {
    //   typescript: {}
    // },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    },
    'import/extensions': ['.ts', '.tsx', '.js', '.jsx']
  },
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
    commonjs: true
  },
  extends: ['eslint:recommended', 'prettier', 'plugin:prettier/recommended', 'plugin:sonarjs/recommended', 'plugin:security/recommended'],
  plugins: ['sonarjs', 'security'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  // parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      parser: '@babel/eslint-parser'
    },
    {
      files: ['rollup.config.js', 'jest.config.js'],
      rules: {
        'monorepo/no-relative-import': 0
      }
    },
    {
      files: ['*.ts', '*.tsx'],
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended', 'plugin:@typescript-eslint/recommended-requiring-type-checking'],
      parser: '@typescript-eslint/parser',
      rules: {
        // Resets
        '@typescript-eslint/camelcase': 0,
        // '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/ban-ts-ignore': 0,
        '@typescript-eslint/no-this-alias': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        // '@typescript-eslint/no-unused-vars': 0,
        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/no-use-before-define': 0,
        // '@typescript-eslint/no-explicit-any': 0,
        'no-constant-condition': 0,

        // General formatting
        '@typescript-eslint/semi': 2,
        '@typescript-eslint/brace-style': 2,
        '@typescript-eslint/func-call-spacing': 2,
        '@typescript-eslint/explicit-module-boundary-types': 0,

        // tslint
        '@typescript-eslint/explicit-member-accessibility': [
          0,
          {
            overrides: {
              constructors: 0
            }
          }
        ],
        // '@typescript-eslint/no-empty-interface': 2,
        '@typescript-eslint/no-inferrable-types': 2,
        '@typescript-eslint/no-misused-new': 2,
        // '@typescript-eslint/no-non-null-assertion': 2,
        // '@typescript-eslint/no-use-before-define': 2,
        '@typescript-eslint/prefer-function-type': 2,
        // '@typescript-eslint/type-annotation-spacing': 2,
        '@typescript-eslint/unified-signatures': 2,
        'no-shadow': 0,
        '@typescript-eslint/no-shadow': 2,
        '@typescript-eslint/array-type': 2,
        // tsrules
        'require-await': 0,
        '@typescript-eslint/require-await': 0,
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          2,
          {
            vars: 'all',
            args: 'after-used',
            ignoreRestSiblings: false,
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_'
          }
        ],
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/unbound-method': [
          2,
          {
            ignoreStatic: true
          }
        ],
        'no-empty-function': 0,
        '@typescript-eslint/no-empty-function': 2,
        '@typescript-eslint/no-unnecessary-type-assertion': 2
      }
    },
    {
      files: ['*.spec.ts', '*.spec.tsx'],
      parser: '@typescript-eslint/parser',
      rules: {
        '@typescript-eslint/no-unsafe-call': 0,
        '@typescript-eslint/no-unsafe-member-access': 0,
        '@typescript-eslint/no-unsafe-assignment': 0,
        '@typescript-eslint/no-unsafe-return': 0,
        '@typescript-eslint/ban-ts-comment': 0,
        'sonarjs/no-duplicate-string': 0
      }
    }
  ],
  rules: {
    // Best practices
    'no-shadow': 2,
    'require-atomic-updates': 2,
    'no-var': 2,
    'prefer-object-spread': 2,
    'no-nested-ternary': 2,
    'no-duplicate-imports': 2,
    // General formatting
    indent: [2, 2, { SwitchCase: 1 }],
    'no-trailing-spaces': 2,
    curly: [2, 'all'],
    'comma-spacing': 2,
    'comma-style': 2,
    'computed-property-spacing': 2,
    // 'func-style': [2, 'expression', { 'allowArrowFunctions': true }],
    // 'multiline-ternary': [1, 'always-multiline'],
    'operator-linebreak': [2, 'after', { overrides: { '?': 'before', ':': 'before' } }],
    // 'linebreak-style': 2,
    'space-in-parens': 2,

    // 'arrow-body-style': [2, 'as-needed', { 'requireReturnForObjectLiteral': true }],
    'constructor-super': 2,
    'dot-notation': 0,
    // 'eol-last': 2,
    'guard-for-in': 2,
    'no-bitwise': 0,
    'no-caller': 2,
    'no-console': [0],
    'no-debugger': 2,
    'no-empty': 0,
    'no-empty-function': 2,
    'no-fallthrough': 2,
    'no-new-wrappers': 2,
    'no-throw-literal': 2,
    'no-undef-init': 2,
    'no-unused-labels': 2,
    'prefer-const': 2,
    radix: 2,
    'no-shadowed-variable': 0,
    'max-params': [2, 3]
  }
};
