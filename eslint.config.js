import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'], languageOptions: { globals: globals.node } },
  { files: ['assets/main.js'], languageOptions: { globals: globals.browser, sourceType: 'script' } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs.customize({
    braceStyle: '1tbs',
    quoteProps: 'as-needed',
    semi: true,
  }),
  {
    rules: {
      'accessor-pairs': 'error',
      'array-callback-return': 'error',
      'arrow-body-style': 'error',
      'block-scoped-var': 'error',
      camelcase: 'warn',
      'class-methods-use-this': 'error',
      'consistent-return': 'error',
      'consistent-this': 'error',
      curly: ['error', 'multi-line'],
      'default-case-last': 'error',
      'default-param-last': 'error',
      'dot-notation': 'error',
      eqeqeq: 'error',
      'func-name-matching': 'error',
      'func-names': 'error',
      'func-style': 'error',
      'grouped-accessor-pairs': 'error',
      'guard-for-in': 'error',
      'id-denylist': 'error',
      'id-length': 'warn',
      'id-match': 'error',
      'logical-assignment-operators': 'error',
      'no-alert': 'error',
      'no-array-constructor': 'error',
      'no-async-promise-executor': 'warn',
      'no-bitwise': 'warn',
      'no-caller': 'error',
      'no-constructor-return': 'error',
      'no-div-regex': 'error',
      'no-duplicate-imports': 'error',
      'no-empty-function': 'error',
      'no-eq-null': 'error',
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-extra-label': 'error',
      'no-implicit-globals': 'error',
      'no-implied-eval': 'error',
      'no-inner-declarations': 'error',
      'no-invalid-this': 'error',
      'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true }],
      'no-label-var': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'error',
      'no-loop-func': 'error',
      'no-multi-assign': 'error',
      'no-multi-str': 'error',
      'no-negated-condition': 'warn',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-object-constructor': 'error',
      'no-octal-escape': 'error',
      'no-param-reassign': 'error',
      'no-promise-executor-return': 'error',
      'no-proto': 'error',
      'no-restricted-exports': 'error',
      'no-restricted-globals': 'error',
      'no-restricted-imports': 'error',
      'no-restricted-properties': 'error',
      'no-restricted-syntax': 'error',
      'no-return-assign': ['error', 'always'],
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-shadow': 'error',
      'no-template-curly-in-string': 'error',
      'no-throw-literal': 'error',
      'no-undef-init': 'error',
      'no-underscore-dangle': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unneeded-ternary': 'error',
      'no-unreachable-loop': 'error',
      'no-unused-expressions': 'error',
      'no-use-before-define': ['error', { variables: false }],
      'no-useless-assignment': 'error',
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      'no-useless-constructor': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'no-void': 'error',
      'no-warning-comments': 'error',
      'object-shorthand': 'error',
      'operator-assignment': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      'prefer-destructuring': 'warn',
      'prefer-exponentiation-operator': 'error',
      'prefer-numeric-literals': 'error',
      'prefer-object-has-own': 'error',
      'prefer-object-spread': 'error',
      'prefer-promise-reject-errors': 'error',
      'prefer-regex-literals': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'warn',
      radix: 'error',
      'require-atomic-updates': 'warn',
      'require-await': 'error',
      strict: 'error',
      'symbol-description': 'error',
      'unicode-bom': 'error',
      'vars-on-top': 'error',
      yoda: 'error',
      '@typescript-eslint/no-empty-object-type': ['error', { allowObjectTypes: 'always' }],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/indent': ['error', 2, { flatTernaryExpressions: true, SwitchCase: 1, VariableDeclarator: 'first' }],
      '@stylistic/max-statements-per-line': ['error', { max: 2 }],
      '@stylistic/multiline-ternary': 'warn',
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
    },
  },
];
