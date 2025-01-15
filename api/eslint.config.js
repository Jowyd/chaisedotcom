module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  rules: {
    // Code style & format
    semi: ["error", "always"],
    quotes: ["error", "single"],
    indent: ["error", 2],
    "comma-dangle": ["error", "always-multiline"],

    // TypeScript specifics
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-explicit-any": "error",

    // Best practices
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error",
  },
  ignorePatterns: [
    "node_modules/",
    "build/",
    "**/*.js",
    "**/*.cjs",
    "**/*.mjs",
    "coverage/",
  ],
  env: {
    node: true,
    es2021: true,
  },
};
