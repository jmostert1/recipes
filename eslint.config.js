module.exports = [
  {
    files: ["src/**/*.js"],
    ignores: ["**/dist/**", "**/node_modules/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        alert: "readonly",
        fetch: "readonly",
        location: "readonly",
        localStorage: "readonly",
        Blob: "readonly",
        URL: "readonly",
        MutationObserver: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "no-undef": "error"
    }
  }
];
