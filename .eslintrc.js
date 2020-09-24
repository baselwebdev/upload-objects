module.exports = {
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
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
            { blankLine: "always", prev: "*", next: "return" },
            { blankLine: "always", prev: ["const", "let", "var"], next: "*"},
            { blankLine: "any",    prev: ["const", "let", "var"], next: ["const", "let", "var"]},
            { blankLine: "always", prev: "import", next: "*" },
            { blankLine: "never", prev: "import", next: "import" },
        ]
    },
}