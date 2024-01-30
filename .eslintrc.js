module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    "mantine",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "next/core-web-vitals"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn"
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  overrides: [
    {
      files: ["*.js"]
    }
  ]
};
