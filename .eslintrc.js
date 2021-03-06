module.exports = {
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier', 'jsdoc'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
    ],
    rules: {
        '@typescript-eslint/naming-convention': [
            'error', { 'selector': 'variableLike', 'format': ['camelCase'] }
        ],
        'padding-line-between-statements': [
            'warn',
            { blankLine: 'always', prev: '*', next: 'return' },
            { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*'},
            { blankLine: 'any',    prev: ['const', 'let', 'var'], next: ['const', 'let', 'var']},
            { blankLine: 'always', prev: 'import', next: '*' },
            { blankLine: 'never', prev: 'import', next: 'import' },
        ],
        'jsdoc/check-access': 1,
        'jsdoc/check-alignment': 1,
        'jsdoc/check-indentation': 1,
        'jsdoc/check-line-alignment': 1,
        'jsdoc/check-param-names': 1,
        'jsdoc/check-property-names': 1,
        'jsdoc/check-syntax': 1,
        'jsdoc/check-tag-names': 1,
        'jsdoc/check-values': 1,
        'jsdoc/empty-tags': 1,
        'jsdoc/implements-on-classes': 1,
        'jsdoc/match-description': 1,
        'jsdoc/no-types': 1,
        'jsdoc/no-bad-blocks': 1,
        'jsdoc/no-defaults': 1,
        'jsdoc/require-description-complete-sentence': 1,
        'jsdoc/require-file-overview': 1,
        'jsdoc/require-hyphen-before-param-description': 1,
        'jsdoc/require-jsdoc': 1,
        'jsdoc/require-param': 1,
        'jsdoc/require-param-description': 1,
        'jsdoc/require-param-name': 1,
        'jsdoc/require-property-description': 1,
        'jsdoc/require-property-name': 1,
        'jsdoc/require-returns': 1,
        'jsdoc/require-returns-check': 1,
        'jsdoc/require-returns-description': 1,
        'jsdoc/valid-types': 1
    },
}