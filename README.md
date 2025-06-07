# Morgen 🌅

![Tests](https://github.com/bitamar/morgen/workflows/Test%20and%20Coverage/badge.svg)
![Coverage](https://github.com/bitamar/morgen/blob/main/badges/coverage-total.svg)

## Development

### Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to ensure code quality:

**Pre-commit hooks:**

- 🎨 **Prettier** - Formats staged files
- 🧹 **ESLint** - Lints and fixes staged TypeScript/JavaScript files
- 🔍 **TypeScript** - Type checks the entire project
- 🧪 **Tests** - Runs the full test suite

**Pre-push hooks:**

- 🔍 **Type checking** - Ensures no TypeScript errors
- 🧹 **Linting** - Ensures code follows style guidelines
- 🧪 **Tests** - Ensures all tests pass

These hooks prevent commits and pushes that would break the build, ensuring main branch stability.
